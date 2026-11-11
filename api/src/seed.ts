import mongoose from 'mongoose';
import { Person, PersonSchema } from './people/person.schema';
import { Site, SiteSchema } from './sites/site.schema';
import { Visit, VisitSchema } from './visits/visit.schema';
import { sanitizeHtml, toText } from './sites/sanitize';

// Fixed anchor: the seed NEVER uses Date.now(), so every run is identical.
const ANCHOR = Date.UTC(2026, 0, 1, 10, 0, 0);

const PEOPLE = [
  { _id: 'p-mara', name: 'Mara' },
  { _id: 'p-jonas', name: 'Jonas' },
  { _id: 'p-priya', name: 'Priya' },
  { _id: 'p-leo', name: 'Leo' },
  { _id: 'p-sam', name: 'Sam' },
];

const mapFacts = [
  'Early mapmakers drew the sea with more care than the land, because sailors paid for the sea.',
  'A compass rose is a promise that north is somewhere, even when the paper is wrong about everything else.',
  'Scale bars were added late. For centuries a map meant a story about distance, not a measurement of it.',
  'Cartographers left blank space and wrote warnings in it. The blank space was honest, the warnings were marketing.',
  'Coastlines on old charts are usually better than the interiors, since someone had to land a boat to draw them.',
  'Ink faded unevenly, so a map you inherit is a record of which parts people touched most.',
  'Fog charts marked the places where a ship could hear the shore before it could see it.',
  'Salt air curls vellum, which is why surviving harbour maps are often flattened and pressed by later owners.',
];
const oldMapsHtml =
  '<h1>Old Maps</h1><p>A slow collection of notes on how people drew places they had never fully seen. Back to <a href="the-index.zz">the index</a>.</p>' +
  mapFacts.map((f, i) => `<h2>Note ${i + 1}</h2><p>${f}</p><p>${f} Every one of these maps was a guess that somebody paid to improve, and the improvements are what we now call geography.</p>`).join('') +
  '<p>The cartographer I like best never published; see <a href="lost-lighthouse.zz">the lost lighthouse</a> if it ever returns.</p>';

const SITES: { address: string; title: string; authorId: string; html: string }[] = [
  {
    address: 'the-index.zz', title: 'The Index', authorId: 'p-leo',
    html: '<h1>The Index</h1><p>A hand-kept list of the small web. If a page is missing, it has not been written yet.</p><ul>' +
      '<li><a href="tidepool.zz">Tidepool Diaries</a></li><li><a href="lighthouse-keepers.zz">Lighthouse Keepers</a></li>' +
      '<li><a href="salt-and-smoke.zz">Salt and Smoke</a></li><li><a href="old-maps.zz">Old Maps</a></li>' +
      '<li><a href="bread-notes.zz">Bread Notes</a></li><li><a href="night-trains.zz">Night Trains</a></li>' +
      '<li><a href="moss-garden.zz">The Moss Garden</a></li><li><a href="radio-fog.zz">Radio Fog</a></li>' +
      '<li><a href="kite-weather.zz">Kite Weather</a></li><li><a href="sea-glass-market.zz">Sea Glass Market</a></li></ul>',
  },
  {
    address: 'tidepool.zz', title: 'Tidepool Diaries', authorId: 'p-mara',
    html: '<h1>Tidepool Diaries</h1><p>Every morning at low tide I walk down to the rocks below the old pier and look into the pools. The tide goes out slowly and leaves small worlds behind: anemones, hermit crabs, and one stubborn blenny that has lived in the same crack for three summers.</p>' +
      '<p>A white salt crust dries on the upper rocks, and the pools get warmer and denser as the sun works on them. I keep a notebook of what moves and when. For the people who watch the same water from above, see <a href="lighthouse-keepers.zz">the lighthouse keepers</a>. For everything else, start at <a href="the-index.zz">the index</a>.</p>' +
      '<p>Sea glass I find goes on <a href="sea-glass-market.zz">the market page</a>, once somebody builds it.</p>',
  },
  {
    address: 'lighthouse-keepers.zz', title: 'Lighthouse Keepers', authorId: 'p-mara',
    html: '<h1>Lighthouse Keepers</h1><p>The keeper before me left a logbook. Most entries are weather, a few are tide tables, and one page just says fog, fog, fog in three different pens. The lamp turns every twelve seconds and nobody has ever told me why twelve.</p>' +
      '<p>On clear nights you can see the glow of the harbour. On foggy nights the horn does the work and the lamp is decoration. There is a second tower, <a href="lost-lighthouse.zz">the lost lighthouse</a>, that older keepers swear used to stand further north. See also <a href="tidepool.zz">the tidepools below</a> and <a href="radio-fog.zz">Radio Fog</a>.</p>',
  },
  {
    address: 'salt-and-smoke.zz', title: 'Salt and Smoke', authorId: 'p-jonas',
    html: '<h1>Salt and Smoke</h1><p>Curing is mostly patience. Salt draws water out, smoke finishes the job, and what is left keeps for months. I salt fish, salt pork, salt butter, and once, regrettably, salt caramel for a week before I understood the problem.</p>' +
      '<p>My brine is a simple ratio: salt, water, a little sugar, a bay leaf. Heavy salt makes it safe, light salt makes it good, and the art is the gap between. The smokehouse runs on apple wood. For bread to eat it with, see <a href="bread-notes.zz">Bread Notes</a>. The sea that gives me the salt is documented at <a href="tidepool.zz">Tidepool Diaries</a>.</p>' +
      '<p>Salt cod, salt herring, salt anchovies: the whole pantry is salt with extra steps.</p>',
  },
  { address: 'old-maps.zz', title: 'Old Maps', authorId: 'p-jonas', html: oldMapsHtml },
  {
    address: 'bread-notes.zz', title: 'Bread Notes', authorId: 'p-priya',
    html: '<h1>Bread Notes</h1><p>My starter is eleven years old and has survived two moves and a very dramatic week in a hot car. Bread is flour, water, salt and time, and most failures come from impatience, not skill.</p>' +
      '<p>A pinch of salt controls the yeast and tightens the dough. I bake in a heavy pot with the lid on for the first twenty minutes. Good bread wants good company, so try it with something cured from <a href="salt-and-smoke.zz">Salt and Smoke</a>. Or read how I get through the night shift on <a href="night-trains.zz">the night trains</a>.</p>',
  },
  {
    address: 'night-trains.zz', title: 'Night Trains', authorId: 'p-priya',
    html: '<h1>Night Trains</h1><p>I collect timetables for sleeper trains that no longer run. The best ones had a restaurant car, a samovar, and a conductor who knew every passenger by name by the second stop.</p>' +
      '<p>The route I miss most ran through the mountains in fog so thick the engine whistled the whole way. People wrote letters on board and posted them at the next platform. If you want a ghost route, try <a href="ghost-station.zz">the ghost station</a>. For radio to listen to while reading timetables, see <a href="radio-fog.zz">Radio Fog</a>.</p>',
  },
  {
    address: 'moss-garden.zz', title: 'The Moss Garden', authorId: 'p-mara',
    html: '<h1>The Moss Garden</h1><p>Moss does not need much: shade, damp, and not being disturbed. My garden is a north-facing wall and a few flat stones, and in three years it has gone from bare to green velvet.</p>' +
      '<p>After rain the whole wall smells like a forest floor. The nearest thing to a tide here is the shadow moving across the stones in the afternoon. For real tide, see <a href="tidepool.zz">Tidepool Diaries</a>.</p>',
  },
  {
    address: 'radio-fog.zz', title: 'Radio Fog', authorId: 'p-leo',
    html: '<h1>Radio Fog</h1><p>An hour of late-night radio, written down. A shipping forecast read slowly, a man who reads out the names of lighthouses, and a woman who plays only songs about weather. Fog rolls in around two.</p>' +
      '<p>If you can hear the foghorn through the speakers, you are close enough to the coast to be worried. Lighthouse logs inspired half of these segments: <a href="lighthouse-keepers.zz">Lighthouse Keepers</a>. The rest came from <a href="kite-weather.zz">Kite Weather</a>.</p>',
  },
  {
    address: 'kite-weather.zz', title: 'Kite Weather', authorId: 'p-sam',
    html: '<h1>Kite Weather</h1><p>The perfect kite day is steady wind from the sea, between twelve and twenty knots, no gusts, no rain. Fog is bad, because you cannot see the kite. A falling tide makes the beach wide and flat, which is where I fly.</p>' +
      '<p>Check the forecast at <a href="radio-fog.zz">Radio Fog</a> before you leave. Lost kites end up at <a href="ghost-station.zz">the ghost station</a>, which is where the wind usually drops them.</p>',
  },
  {
    // Hostile fixture: goes through the same sanitizer as every publish.
    address: 'hostile-demo.zz', title: 'Hostile Demo', authorId: 'p-sam',
    html: '<h1>Hostile Demo</h1><p>This page tries every trick.</p>' +
      '<script>alert("script")</script>' +
      '<img src="x" onerror="alert(1)">' +
      '<iframe src="https://evil.example"></iframe>' +
      '<meta http-equiv="refresh" content="0;url=https://evil.example">' +
      '<svg onload="alert(1)"></svg>' +
      '<form action="https://evil.example"><input name="pw"></form>' +
      '<p onclick="alert(1)">click me</p>' +
      '<a href="javascript:alert(1)">javascript link</a> <a href="https://evil.example">http link</a> <a href="kite-weather.zz">safe link</a>' +
      '<div style="position:fixed;top:0;left:0;right:0;height:80px;z-index:9999;background:red;color:white">FAKE OVERLAY trying to cover the address bar</div>',
  },
];

const ADDRESSES = SITES.map((s) => s.address);

type Step = [string, string]; // [address, via]
function trail(personId: string, startMin: number, steps: Step[]) {
  return steps.map(([address, via], i) => ({
    visitId: `seed-${personId}-${startMin}-${i}`,
    personId,
    address,
    at: new Date(ANCHOR + (startMin + i * 2) * 60_000),
    via,
    found: ADDRESSES.includes(address),
  }));
}

const VISITS = [
  ...trail('p-mara', 0, [
    ['the-index.zz', 'typed'], ['tidepool.zz', 'link'], ['lighthouse-keepers.zz', 'link'],
    ['lost-lighthouse.zz', 'link'], ['lighthouse-keepers.zz', 'back'], ['tidepool.zz', 'back'],
    ['moss-garden.zz', 'link'], ['tidepool.zz', 'history'],
  ]),
  ...trail('p-mara', 30, [
    ['tidepool.zz', 'typed'], ['salt-and-smoke.zz', 'search'], ['bread-notes.zz', 'link'], ['tidepool.zz', 'history'],
  ]),
  ...trail('p-jonas', 5, [
    ['old-maps.zz', 'typed'], ['lost-lighthouse.zz', 'link'], ['old-maps.zz', 'back'],
    ['the-index.zz', 'link'], ['kite-weather.zz', 'link'], ['radio-fog.zz', 'link'],
    ['ghost-station.zz', 'link'], ['radio-fog.zz', 'back'], ['night-trains.zz', 'link'],
  ]),
  ...trail('p-jonas', 40, [['salt-and-smoke.zz', 'typed'], ['old-maps.zz', 'history'], ['old-maps.zz', 'typed']]),
  ...trail('p-priya', 10, [
    ['bread-notes.zz', 'typed'], ['salt-and-smoke.zz', 'link'], ['tidepool.zz', 'link'],
    ['sea-glass-market.zz', 'link'], ['tidepool.zz', 'back'], ['bread-notes.zz', 'history'],
  ]),
  ...trail('p-priya', 45, [['night-trains.zz', 'typed'], ['the-index.zz', 'link'], ['radio-fog.zz', 'link']]),
  ...trail('p-sam', 15, [
    ['kite-weather.zz', 'typed'], ['radio-fog.zz', 'link'], ['hostile-demo.zz', 'typed'],
    ['kite-weather.zz', 'link'], ['radio-fog.zz', 'forward'],
  ]),
  // Leo has been nearly everywhere (all sites plus the dead addresses), twice over in places.
  ...trail('p-leo', 2, [
    ['the-index.zz', 'typed'], ['tidepool.zz', 'link'], ['lighthouse-keepers.zz', 'link'],
    ['lost-lighthouse.zz', 'link'], ['radio-fog.zz', 'typed'], ['kite-weather.zz', 'link'],
    ['hostile-demo.zz', 'link'], ['salt-and-smoke.zz', 'typed'], ['bread-notes.zz', 'link'],
    ['night-trains.zz', 'link'], ['ghost-station.zz', 'link'], ['old-maps.zz', 'typed'],
    ['moss-garden.zz', 'typed'], ['sea-glass-market.zz', 'typed'], ['the-index.zz', 'history'],
  ]),
  ...trail('p-leo', 38, [['tidepool.zz', 'history'], ['salt-and-smoke.zz', 'history'], ['old-maps.zz', 'history']]),
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://localhost:27017/smallweb');
  const PersonM = mongoose.model(Person.name, PersonSchema);
  const SiteM = mongoose.model(Site.name, SiteSchema);
  const VisitM = mongoose.model(Visit.name, VisitSchema);
  await Promise.all([PersonM.init(), SiteM.init(), VisitM.init()]);

  await PersonM.bulkWrite(
    PEOPLE.map((p) => ({ updateOne: { filter: { _id: p._id }, update: { $set: { name: p.name } }, upsert: true } })),
  );

  await SiteM.bulkWrite(
    SITES.map((s) => {
      const html = sanitizeHtml(s.html);
      return {
        updateOne: {
          filter: { address: s.address },
          update: { $set: { title: s.title, authorId: s.authorId, html, text: toText(html), createdAt: new Date(ANCHOR) } },
          upsert: true,
        },
      };
    }),
  );

  await VisitM.bulkWrite(
    VISITS.map((v) => ({ updateOne: { filter: { visitId: v.visitId }, update: { $set: v }, upsert: true } })),
  );

  console.log(`Seeded: ${PEOPLE.length} people, ${SITES.length} sites, ${VISITS.length} visits`);
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });