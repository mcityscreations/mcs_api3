/*
CREATE VIEW content.v_people AS
SELECT
    p.id_public AS id,
    CASE
    WHEN p.is_organization THEN 'organization'
    ELSE 'individual'
    END AS type,
    CASE 
        WHEN p.is_organization THEN
            jsonb_build_object(
                'legalName', po.legal_name,
                'category', jsonb_build_object(
                    'id', poc.id_public,
                    'name', poc.name
                ),
                'registrationCountry', jsonb_build_object(
                    'id', country.id_public,
                    'name', country.label
                ),
                'idRegistration', po.id_registration,
                'idVAT', po.id_vat
            )
        ELSE
            jsonb_build_object(
                'firstname', pid.firstname,
                'lastname', pid.lastname
            )
    END AS details
FROM content.people p
LEFT JOIN content.people_individual_detail pid ON pid.id_person = p.id_person
LEFT JOIN content.people_organization_detail po ON po.id_person = p.id_person
LEFT JOIN content.people_organization_category poc ON poc.id_organization_category = po.id_organization_category
LEFT JOIN content.country country ON country.id_country = po.registration_country;
*/
