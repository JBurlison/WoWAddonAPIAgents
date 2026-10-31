# Non-generated events and internal callbacks

The alphabetical catalogues contain every generated Event declaration at the pinned commits. They do not claim every runtime event or handwritten callback has been discovered. The old unversioned list of allegedly undocumented events has been removed because it did not establish current per-target availability or payloads.

## Evidence required for an additional entry

Record the literal name, target/build, source commit and caller/dispatcher path, frame-event versus callback classification, ordered payload schema or explicitly unknown fields, loading requirements, access restrictions, and a reproducible permitted runtime scenario. A reference to a name in unexecuted or excluded UI code is source evidence only.

## Known separate callback surface

Forever's [Legacy utility](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystemUtil.lua) publishes `Legacy.UpdateCurrencyInfo` through EventRegistry. That is a loaded-UI callback, not a generated frame event. Consult the [talent skill](../../wow-api-talents/SKILL.md) and [FrameXML skill](../../wow-api-framexml/SKILL.md) for its ownership and dispatcher evidence before subscribing.

The older [Forever runtime capture](https://github.com/Thunderz96/forever-addon-kit/blob/8dc297689059dd204bf8663a05aaa36d6a628b76/data/forever_api.json) contains function names and frames but no event catalogue or payload schemas. It cannot fill these gaps. A RegisterAllEvents observer can record only events actually delivered in its tested context; it is not an exhaustive API inventory.
