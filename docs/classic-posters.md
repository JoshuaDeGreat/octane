# Classic posters

Classic wall posters share furniture class `poster` and use the offer's extra
parameter for the design number. Catalogue selection preserves that number for
normal purchases and gifts. Polaris also resolves it from the configured offer
when older clients omit it.

`scripts/restore-poster-icons.py` extracts existing PNG spritesheets from Heaven's
numbered Nitro bundles. Each static SVG embeds its original PNG and crops to the
icon frame using a viewBox. It has no scripts or remote image references. Only
successfully decoded designs are listed in `classicPosterIds.json`; the catalogue
and inventory use those local icons. Other furniture keeps its existing URLs.

The recovery produced 97 icons. Poster 599's bundle was unavailable and is not
included. Its original artwork is still required if that design is offered.

Existing blank poster instances cannot safely be assigned a guessed design.
Recovery needs an exact item-id match in the purchase log and the corresponding
catalogue offer's poster number, with a backup of each changed value. Staff
purchases may have no shop log when infinite credits are enabled. No existing
item data is changed by this client release.
