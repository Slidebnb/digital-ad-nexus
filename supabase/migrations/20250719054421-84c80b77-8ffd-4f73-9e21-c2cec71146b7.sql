-- Neue Kategorien für Krypto-Marktplatz hinzufügen

-- Mining Equipment & Hardware
INSERT INTO public.categories (
  id,
  name,
  slug,
  icon,
  description,
  sort_order,
  active,
  created_at
) VALUES (
  gen_random_uuid(),
  'Mining & Hardware',
  'mining-hardware',
  'cpu',
  'Mining Rigs, GPUs, ASIC Miner, Hardware Wallets',
  6,
  true,
  now()
);

-- Krypto-Services und Bildung
INSERT INTO public.categories (
  id,
  name,
  slug,
  icon,
  description,
  sort_order,
  active,
  created_at
) VALUES (
  gen_random_uuid(),
  'Krypto-Services',
  'krypto-services',
  'graduation-cap',
  'Trading Kurse, Beratung, Steuerhilfe, Wallets',
  7,
  true,
  now()
);

-- Update der bestehenden Kategorien für bessere Sortierung
UPDATE public.categories SET sort_order = 1 WHERE slug = 'elektronik';
UPDATE public.categories SET sort_order = 2 WHERE slug = 'fahrzeuge';
UPDATE public.categories SET sort_order = 3 WHERE slug = 'immobilien';
UPDATE public.categories SET sort_order = 4 WHERE slug = 'mode';
UPDATE public.categories SET sort_order = 5 WHERE slug = 'dienstleistungen';
UPDATE public.categories SET sort_order = 8 WHERE slug = 'sonstiges';