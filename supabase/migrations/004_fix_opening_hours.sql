-- Fix opening hours to match actual business schedule
-- Tue–Thu: 10 am – 9 pm, Fri: 10 am – 8 pm, Sat: 10 am – 6 pm, Sun–Mon: Closed

UPDATE opening_hours SET open_time = '10:00', close_time = '21:00', is_closed = false WHERE day = 'tuesday';
UPDATE opening_hours SET open_time = '10:00', close_time = '21:00', is_closed = false WHERE day = 'wednesday';
UPDATE opening_hours SET open_time = '10:00', close_time = '21:00', is_closed = false WHERE day = 'thursday';
UPDATE opening_hours SET open_time = '10:00', close_time = '20:00', is_closed = false WHERE day = 'friday';
UPDATE opening_hours SET open_time = '10:00', close_time = '18:00', is_closed = false WHERE day = 'saturday';
UPDATE opening_hours SET open_time = NULL,    close_time = NULL,    is_closed = true  WHERE day = 'sunday';
UPDATE opening_hours SET open_time = NULL,    close_time = NULL,    is_closed = true  WHERE day = 'monday';
