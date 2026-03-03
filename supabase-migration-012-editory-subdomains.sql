-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 012 — Assign Editory Group subdomains to hotel_config
--
-- Maps each Vercel domain (*.boredtourist.com) to its hotel DB id
-- so the frontend can resolve hotel_id via subdomain lookup.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE hotel_config SET subdomain = 'editoryriverdelisboa'      WHERE id = 'editory-riverside-lisboa';
UPDATE hotel_config SET subdomain = 'editoryresidencelagos'     WHERE id = 'editory-residence-lagos';
UPDATE hotel_config SET subdomain = 'editoryportopalacio'       WHERE id = 'editory-porto-palacio';
UPDATE hotel_config SET subdomain = 'editoryoceanway'           WHERE id = 'editory-ocean-way-funchal';
UPDATE hotel_config SET subdomain = 'editoryhouseribeira'       WHERE id = 'editory-house-ribeira-porto';
UPDATE hotel_config SET subdomain = 'editorygardencarmo'        WHERE id = 'editory-garden-carmo-funchal';
UPDATE hotel_config SET subdomain = 'editorygardenbaixa'        WHERE id = 'editory-garden-baixa-porto';
UPDATE hotel_config SET subdomain = 'editoryflordesal'          WHERE id = 'editory-flor-de-sal-viana';
UPDATE hotel_config SET subdomain = 'editorybythesea'           WHERE id = 'editory-by-the-sea-lagos';
UPDATE hotel_config SET subdomain = 'editoryboulevardaliados'   WHERE id = 'editory-boulevard-aliados-porto';
UPDATE hotel_config SET subdomain = 'editoryartistbaixaporto'   WHERE id = 'editory-artist-baixa-porto';
UPDATE hotel_config SET subdomain = 'editoryaqualuzlagos'       WHERE id = 'editory-aqualuz-lagos';

-- Verify
SELECT id, name, subdomain FROM hotel_config ORDER BY subdomain NULLS LAST;
