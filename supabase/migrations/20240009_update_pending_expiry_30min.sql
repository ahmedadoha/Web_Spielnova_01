-- Migration: update pending_payment expiry from 15 → 30 minutes
--
-- Stripe requires expires_at to be at least 30 minutes from Checkout Session
-- creation. The lazy-expiry cutoff in create_booking_if_available must match
-- so that a slot is never freed while a customer is still in the payment flow.
--
-- To apply: run this file in Supabase → SQL Editor.

CREATE OR REPLACE FUNCTION create_booking_if_available(
    p_start_time       TIMESTAMPTZ,
    p_end_time         TIMESTAMPTZ,
    p_arena_id         TEXT,
    p_arenas_count     INT,
    p_game_mode        TEXT,
    p_game_slug        TEXT,
    p_player_count     INT,
    p_customer_name    TEXT,
    p_customer_email   TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_booking_id    UUID;
    v_max_occupied  INT := 0;
    v_chunk_start   TIMESTAMPTZ;
    v_chunk_end     TIMESTAMPTZ;
    v_chunk_arenas  INT;
    v_cutoff        TIMESTAMPTZ;
BEGIN
    -- Acquire a transaction-scoped advisory lock keyed on the slot start time.
    PERFORM pg_advisory_xact_lock(
        EXTRACT(EPOCH FROM DATE_TRUNC('minute', p_start_time))::BIGINT
    );

    -- pending_payment rows older than 30 min are treated as expired.
    -- 30 min matches the Stripe Checkout Session lifetime.
    v_cutoff := NOW() - INTERVAL '30 minutes';

    -- Check each 30-min chunk across the full requested duration
    v_chunk_start := p_start_time;
    WHILE v_chunk_start < p_end_time LOOP
        v_chunk_end := v_chunk_start + INTERVAL '30 minutes';

        SELECT COALESCE(SUM(arenas_count), 0) INTO v_chunk_arenas
        FROM bookings
        WHERE status NOT IN ('cancelled', 'deleted')
          AND NOT (status = 'pending_payment' AND created_at < v_cutoff)
          AND start_time < v_chunk_end
          AND end_time   > v_chunk_start;

        IF v_chunk_arenas > v_max_occupied THEN
            v_max_occupied := v_chunk_arenas;
        END IF;

        v_chunk_start := v_chunk_end;
    END LOOP;

    -- Not enough arenas available — return error indicator
    IF (v_max_occupied + p_arenas_count) > 2 THEN
        RETURN json_build_object('error', 'slot_unavailable');
    END IF;

    -- Slot is free — insert and return the new booking id
    INSERT INTO bookings (
        start_time, end_time, arena_id, arenas_count,
        game_mode, game_slug, player_count,
        customer_name, customer_email, status
    ) VALUES (
        p_start_time, p_end_time, p_arena_id, p_arenas_count,
        p_game_mode, p_game_slug, p_player_count,
        p_customer_name, p_customer_email, 'pending_payment'
    )
    RETURNING id INTO v_booking_id;

    RETURN json_build_object('booking_id', v_booking_id);
END;
$$;
