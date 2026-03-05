-- Seed Pennsylvania home care agencies for development
-- Run this in Supabase SQL editor to populate the agencies table

INSERT INTO agencies (
  npi, name, dba_name,
  address_line1, address_city, address_state, address_zip,
  phone, email, website,
  care_types, payers_accepted, services_offered, languages_spoken,
  service_counties, is_verified_partner, is_active,
  medicare_quality_score, avg_response_hours, pa_license_number
) VALUES

-- Allegheny County agencies
(
  '1234567890', 'UPMC Home Health Services', 'UPMC Home Health',
  '600 Grant Street', 'Pittsburgh', 'PA', '15219',
  '(412) 647-8762', 'homehealth@upmc.edu', 'https://www.upmc.com',
  ARRAY['home_health','home_care']::care_type[],
  ARRAY['medicaid','medicare','private','waiver']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','speech_therapy','home_health_aide','personal_care'],
  ARRAY['English','Spanish','Nepali'],
  ARRAY['Allegheny','Westmoreland','Butler','Beaver','Washington'],
  true, true, 4.5, 4.0, 'HHA-123456'
),
(
  '1345678901', 'Allegheny Health Network Home Care', 'AHN Home Care',
  '320 East North Avenue', 'Pittsburgh', 'PA', '15212',
  '(412) 359-3131', 'homecare@ahn.org', 'https://www.ahn.org',
  ARRAY['home_health','home_care']::care_type[],
  ARRAY['medicaid','medicare','private']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','home_health_aide','personal_care','companion_care'],
  ARRAY['English','Spanish'],
  ARRAY['Allegheny','Butler','Lawrence','Beaver','Washington'],
  true, true, 4.3, 6.0, 'HHA-234567'
),
(
  '1456789012', 'Visiting Angels of Pittsburgh', NULL,
  '1801 Centre Avenue', 'Pittsburgh', 'PA', '15219',
  '(412) 431-9050', 'pittsburgh@visitingangels.com', 'https://www.visitingangels.com',
  ARRAY['home_care']::care_type[],
  ARRAY['private','self_pay','waiver']::payer_type[],
  ARRAY['personal_care','companion_care','homemaker','respite_care','medication_reminders','meal_preparation'],
  ARRAY['English','Hindi'],
  ARRAY['Allegheny','Westmoreland','Washington'],
  false, true, NULL, 8.0, 'HCS-345678'
),
(
  '1567890123', 'Right at Home Pittsburgh', NULL,
  '4 Northside Complex', 'Pittsburgh', 'PA', '15212',
  '(412) 231-4450', 'pittsburgh@rightathome.net', 'https://www.rightathome.net',
  ARRAY['home_care']::care_type[],
  ARRAY['medicaid','private','self_pay','waiver']::payer_type[],
  ARRAY['personal_care','companion_care','homemaker','respite_care','transportation','meal_preparation'],
  ARRAY['English','Nepali','Hindi'],
  ARRAY['Allegheny','Westmoreland','Butler'],
  true, true, NULL, 10.0, 'HCS-456789'
),

-- Philadelphia area
(
  '1678901234', 'Jefferson Home Health', 'Jefferson Health at Home',
  '111 South 11th Street', 'Philadelphia', 'PA', '19107',
  '(215) 955-6000', 'homehealth@jefferson.edu', 'https://www.jeffersonhealth.org',
  ARRAY['home_health']::care_type[],
  ARRAY['medicaid','medicare','private']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','speech_therapy','medical_social_work','home_health_aide'],
  ARRAY['English','Spanish','Chinese','Arabic'],
  ARRAY['Philadelphia','Delaware','Montgomery','Bucks','Chester'],
  true, true, 4.7, 3.5, 'HHA-567890'
),
(
  '1789012345', 'Penn Home Health', NULL,
  '3900 Woodland Avenue', 'Philadelphia', 'PA', '19104',
  '(215) 662-3900', 'homehealth@pennmedicine.upenn.edu', 'https://www.pennmedicine.org',
  ARRAY['home_health']::care_type[],
  ARRAY['medicaid','medicare','private']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','speech_therapy','medical_social_work'],
  ARRAY['English','Spanish'],
  ARRAY['Philadelphia','Montgomery','Delaware'],
  true, true, 4.8, 4.0, 'HHA-678901'
),
(
  '1890123456', 'Comfort Keepers Philadelphia', NULL,
  '1515 Market Street Suite 1200', 'Philadelphia', 'PA', '19102',
  '(215) 564-2273', 'philly@comfortkeepers.com', 'https://www.comfortkeepers.com',
  ARRAY['home_care']::care_type[],
  ARRAY['medicaid','private','self_pay','waiver']::payer_type[],
  ARRAY['personal_care','companion_care','homemaker','respite_care','medication_reminders','transportation'],
  ARRAY['English','Spanish','French'],
  ARRAY['Philadelphia','Montgomery','Delaware','Bucks'],
  false, true, NULL, 12.0, 'HCS-789012'
),

-- Lancaster / Central PA
(
  '1901234567', 'Penn Medicine Lancaster General Home Health', NULL,
  '555 North Duke Street', 'Lancaster', 'PA', '17602',
  '(717) 544-5511', 'homehealth@pennmedicine.org', 'https://www.lancastergeneralhealth.org',
  ARRAY['home_health','home_care']::care_type[],
  ARRAY['medicaid','medicare','private','waiver']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','home_health_aide','personal_care'],
  ARRAY['English','Spanish'],
  ARRAY['Lancaster','Lebanon','Dauphin','York'],
  true, true, 4.4, 5.0, 'HHA-890123'
),
(
  '2012345678', 'Family First Home Companions Lancaster', NULL,
  '1853 William Penn Way', 'Lancaster', 'PA', '17601',
  '(717) 569-7333', 'info@familyfirsthomecompanions.com', 'https://www.familyfirsthomecompanions.com',
  ARRAY['home_care']::care_type[],
  ARRAY['medicaid','private','self_pay','waiver']::payer_type[],
  ARRAY['personal_care','companion_care','homemaker','respite_care','meal_preparation'],
  ARRAY['English','Spanish','Pennsylvania Dutch'],
  ARRAY['Lancaster','Lebanon','York','Dauphin'],
  false, true, NULL, 8.0, 'HCS-901234'
),

-- Erie
(
  '2123456789', 'LECOM Health Home Care', NULL,
  '2060 West Grandview Boulevard', 'Erie', 'PA', '16506',
  '(814) 866-6901', 'homecare@lecom.edu', 'https://www.lecomhealth.com',
  ARRAY['home_health','home_care']::care_type[],
  ARRAY['medicaid','medicare','private']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','home_health_aide','personal_care','companion_care'],
  ARRAY['English'],
  ARRAY['Erie','Crawford','Venango','Mercer'],
  true, true, 4.2, 6.0, 'HHA-012345'
),

-- Lehigh Valley
(
  '2234567890', 'Lehigh Valley Hospital Home Health', NULL,
  '1200 South Cedar Crest Boulevard', 'Allentown', 'PA', '18103',
  '(610) 402-8000', 'homehealth@lvhn.org', 'https://www.lvhn.org',
  ARRAY['home_health']::care_type[],
  ARRAY['medicaid','medicare','private']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','speech_therapy','medical_social_work','home_health_aide'],
  ARRAY['English','Spanish'],
  ARRAY['Lehigh','Northampton','Carbon','Monroe','Berks'],
  true, true, 4.6, 4.5, 'HHA-123450'
),

-- Scranton / Northeastern PA
(
  '2345678901', 'Geisinger Home Health', NULL,
  '100 North Academy Avenue', 'Danville', 'PA', '17822',
  '(570) 271-6211', 'homehealth@geisinger.edu', 'https://www.geisinger.org',
  ARRAY['home_health','home_care']::care_type[],
  ARRAY['medicaid','medicare','private','waiver']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','speech_therapy','home_health_aide','personal_care'],
  ARRAY['English'],
  ARRAY['Montour','Columbia','Northumberland','Snyder','Union','Lycoming','Luzerne','Lackawanna'],
  true, true, 4.7, 3.0, 'HHA-234560'
),
(
  '2456789012', 'BrightSpring Home Services Scranton', NULL,
  '149 Penn Avenue', 'Scranton', 'PA', '18503',
  '(570) 961-1000', 'scranton@brightspring.com', 'https://www.brightspring.com',
  ARRAY['home_care']::care_type[],
  ARRAY['medicaid','waiver']::payer_type[],
  ARRAY['personal_care','companion_care','homemaker','respite_care'],
  ARRAY['English','Spanish'],
  ARRAY['Lackawanna','Luzerne','Wayne','Monroe','Pike'],
  false, true, NULL, 10.0, 'HCS-345670'
),

-- Harrisburg / Dauphin
(
  '2567890123', 'PinnacleHealth Home Health', 'UPMC Pinnacle Home Health',
  '111 South Front Street', 'Harrisburg', 'PA', '17101',
  '(717) 231-8900', 'homehealth@upmcpinnacle.com', 'https://www.upmcpinnaclehealth.org',
  ARRAY['home_health']::care_type[],
  ARRAY['medicaid','medicare','private']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','speech_therapy','home_health_aide'],
  ARRAY['English','Spanish'],
  ARRAY['Dauphin','Cumberland','Perry','York','Lebanon'],
  true, true, 4.3, 5.0, 'HHA-456780'
),

-- Statewide / large providers
(
  '2678901234', 'Maxim Healthcare Services', NULL,
  '7227 Lee DeForest Drive', 'Columbia', 'PA', '21046',
  '(410) 910-1400', 'info@maximhealthcare.com', 'https://www.maximhealthcare.com',
  ARRAY['home_health','home_care']::care_type[],
  ARRAY['medicaid','medicare','private','waiver','self_pay']::payer_type[],
  ARRAY['skilled_nursing','home_health_aide','personal_care','companion_care','respite_care'],
  ARRAY['English','Spanish'],
  ARRAY['Philadelphia','Allegheny','Montgomery','Delaware','Bucks','Chester','Lancaster','York','Dauphin','Berks'],
  false, true, 3.8, 8.0, 'HHA-567801'
),
(
  '2789012345', 'Kindred at Home Pennsylvania', NULL,
  '680 South Fourth Street', 'Louisville', 'PA', '15090',
  '(877) 546-3373', 'info@kindredhospitals.com', 'https://www.kindredathome.com',
  ARRAY['home_health']::care_type[],
  ARRAY['medicaid','medicare','private']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','speech_therapy','medical_social_work','home_health_aide'],
  ARRAY['English'],
  ARRAY['Allegheny','Westmoreland','Washington','Beaver','Butler','Lawrence'],
  false, true, 3.9, 8.0, 'HHA-678902'
),
(
  '2890123456', 'Bayada Home Health Care', NULL,
  '290 Chester Pike', 'Prospect Park', 'PA', '19076',
  '(610) 534-1655', 'info@bayada.com', 'https://www.bayada.com',
  ARRAY['home_health','home_care']::care_type[],
  ARRAY['medicaid','medicare','private','waiver','self_pay']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','speech_therapy','home_health_aide','personal_care','companion_care','respite_care'],
  ARRAY['English','Spanish','Chinese','Korean','Vietnamese','Hindi','Nepali'],
  ARRAY['Philadelphia','Delaware','Montgomery','Bucks','Chester','Lancaster','Allegheny','Dauphin','Berks','Lehigh','Northampton'],
  true, true, 4.5, 5.0, 'HHA-789023'
),
(
  '2901234567', 'Elara Caring Pennsylvania', NULL,
  '3000 Market Street', 'Philadelphia', 'PA', '19104',
  '(888) 651-9951', 'info@elaracaring.com', 'https://www.elaracaring.com',
  ARRAY['home_health','home_care']::care_type[],
  ARRAY['medicaid','medicare','private','waiver']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','speech_therapy','home_health_aide','personal_care'],
  ARRAY['English','Spanish'],
  ARRAY['Philadelphia','Allegheny','Bucks','Montgomery','Chester','Delaware','Lancaster'],
  false, true, 4.0, 7.0, 'HHA-890034'
),
(
  '3012345678', 'Chautari Partner Care Network', NULL,
  '100 Market Street Suite 200', 'Pittsburgh', 'PA', '15222',
  '(412) 555-0100', 'info@chautari.health', 'https://www.chautari.health',
  ARRAY['home_health','home_care']::care_type[],
  ARRAY['medicaid','medicare','private','waiver','self_pay']::payer_type[],
  ARRAY['skilled_nursing','physical_therapy','occupational_therapy','home_health_aide','personal_care','companion_care','homemaker','respite_care'],
  ARRAY['English','Nepali','Hindi','Spanish'],
  ARRAY['Allegheny','Westmoreland','Butler','Beaver','Washington','Lawrence'],
  true, true, 5.0, 2.0, 'HHA-DEMO01'
);
