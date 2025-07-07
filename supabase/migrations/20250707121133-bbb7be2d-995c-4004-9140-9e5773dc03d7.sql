-- Entferne die alte Version der Funktion die eine TABLE returnt
DROP FUNCTION IF EXISTS public.update_verification_status(p_request_id uuid, p_status text, p_admin_notes text);

-- Stelle sicher, dass nur die bessere Version existiert (die mit p_admin_id parameter)
-- Diese ist bereits vorhanden, daher müssen wir nichts weiter tun