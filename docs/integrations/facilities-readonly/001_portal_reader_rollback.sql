revoke all on portal_readonly.facility_reservations from portal_reader;
revoke usage on schema portal_readonly from portal_reader;
drop view if exists portal_readonly.facility_reservations;
drop schema if exists portal_readonly;
drop role if exists portal_reader;
