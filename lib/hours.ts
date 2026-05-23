/**
 * Spielnova Central Opening and Booking Hours Configuration
 * 
 * Edit this file to change the visual hours on the website (contact and opening hours pages)
 * and the actual booking slot generation engine hours in the backend.
 */

export const OPENING_HOURS = {
    // Visual text display strings
    visual: {
        weekdays: "14:00 - 20:00 Uhr",
        saturday: "10:00 - 20:00 Uhr",
        sunday: "Geschlossen (Einkaufzentrum)",
        holidays: "10:00 - 20:00 Uhr",
        weekdaysLabel: "Mo. - Fr.",
        saturdayLabel: "Samstag",
        sundayLabel: "Sonntag",
        holidaysLabel: "In Schulferien"
    },
    
    // Booking engine slot configurations
    engine: {
        // Weekdays: 14:30 - 20:00
        weekday: {
            startHour: 14,
            startMinute: 30,
            endHour: 20
        },
        // Saturdays & School Holidays: 10:00 - 20:00
        weekendOrHoliday: {
            startHour: 10,
            startMinute: 0,
            endHour: 20
        }
    }
}
