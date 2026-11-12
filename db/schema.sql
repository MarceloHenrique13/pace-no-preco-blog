-- Pace no Preço — affiliate admin + publish gate

CREATE TABLE IF NOT EXISTS affiliate_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  shoe_name text NOT NULL,
  affiliate_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_slug, shoe_name)
);

CREATE TABLE IF NOT EXISTS weekly_highlights (
  id integer PRIMARY KEY CHECK (id = 1),
  week_label text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  shoes jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS post_publications (
  post_slug text PRIMARY KEY,
  published_at timestamptz NOT NULL DEFAULT now()
);

-- target: '__cover__' for post coverImage, or exact shoes[].name for shoe image
CREATE TABLE IF NOT EXISTS post_image_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  target text NOT NULL,
  image_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_slug, target)
);
