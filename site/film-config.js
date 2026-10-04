/* Sisyphus × Sociogram — every number and word that depends on the film lives in this one object.
   A new film is a retune of this file only (see _source/tools/README-track.md):
     1. encode it with _source/tools/scrub-encode,
     2. dump frames with _source/tools/track-frames.swift,
     3. read the positions below off those frames,
     4. open the page with ?debug, which draws every track and every sky box over the film.
   Times are seconds of a film `referenceDuration` long; a longer or shorter film scales them.
   Positions are fractions of the full 16:9 frame: x of its width, y of its height. */
const FILM = {
  src: 'video/woman-full.mp4',              // version 15: the whole page on wide screens. The 1920×1080 frame at its own pixels,
                                            // 12 Mbps, keyframe every 8 frames: sharp and quick to seek
  portraitSrc: 'video/woman-portrait.mp4',  // dedicated 9:16 film supplied for mobile, 720×1280 web encode
  portraitPoster: 'video/woman-portrait-poster.jpg',
  portraitStills: 'video/woman-portrait-still-',
  narrowFullscreen: true,                   // full portrait film with an interactive sky on mobile
  narrowSkyOnly: false,
  poster: 'video/woman-poster-full.jpg',
  referenceDuration: 15.04,                 // the Kling climb, 361 frames at 24 fps
  allIntra: false,                          // true only for every-frame-keyframe encodes (enables fastSeek)
  // Version 15: on wide screens the film covers the whole page, edge to edge and under the bar, never zoomed past
  // cover; the words sit on it in the left half. The frame is pinned to the left edge (wideFocusX, the object-position),
  // so whatever cover crops comes off the right and the woman stays as far from the words as she can.
  halfCrop: null,                           // { from, to, width }: a panning crop for a film in the right half only (unused)
  wideFocusX: 0,
  mirror: false,                            // true flips the film and every overlay with it (x → 1 − x in the mapping)

  // One moment of the film per station of the page.
  stations: [
    { station: 'absurd', t: 0 },
    { station: 'boulder-1', t: 2.5 },       // the cliff and its people
    { station: 'boulder-2', t: 4.5 },       // the tower and its door
    { station: 'boulder-3', t: 6.5 },       // the blocks along the ramp; someone sits down to review
    { station: 'lever', t: 8.5 },           // the portal: two pillars and a beam
    { station: 'path', t: 10.5 },           // the steps on the plateau
    { station: 'person', t: 12.5 },         // people gather under the portal
    { station: 'summit', t: 14.6 },         // she stands beside the boulder; the last frame holds
  ],

  // Things in the film, keyframed as [time, x, y], read off frames every second.
  track: {
    climber: [[0, .445, .735], [1, .44, .742], [2, .466, .748], [3, .475, .73], [4, .478, .72], [5, .473, .71], [6, .462, .706], [7, .436, .7], [8, .427, .7], [9, .41, .695], [10, .385, .7], [11, .38, .695], [12, .383, .685], [13, .39, .67], [14, .392, .65], [15.04, .387, .672]],
    sphere: [[0, .505, .695], [1, .51, .696], [2, .538, .688], [3, .545, .677], [4, .547, .672], [5, .541, .664], [6, .529, .662], [7, .5, .653], [8, .48, .65], [9, .47, .648], [10, .447, .646], [11, .44, .64], [12, .437, .637], [13, .447, .63], [14, .441, .628], [15.04, .44, .64]],
    // the tower's door: a fixed thing in the scene, used as the reference for what is left behind (`world`)
    door: [[0, .962, .44], [2, .96, .44], [3, .935, .445], [4, .886, .455], [5, .827, .45], [6, .76, .48], [7, .67, .5], [8, .608, .505], [9, .546, .51], [10, .473, .53], [11, .41, .54], [12, .362, .545], [13, .298, .55], [14, .294, .558], [15.04, .29, .565]],
    cliffTop: [[0, .55, .385], [1, .545, .385], [2, .56, .375], [3, .557, .375], [4, .49, .38], [5, .457, .385], [6, .37, .395], [7, .29, .4], [8, .23, .405], [9, .12, .41]],
    cliffPeople: [[0, .453, .425], [1, .453, .42], [2, .455, .418], [3, .43, .415], [4, .39, .426], [5, .345, .43], [6, .25, .43], [7, .176, .43], [8, .12, .44]],
    blocks: [[0, .55, .84], [4, .5, .85], [5, .48, .855], [6, .44, .885], [7, .32, .92], [8, .25, .935]],
    // someone who sits down on the steps
    sitter: [[6.8, .97, .62], [7, .935, .625], [8, .86, .645], [9, .787, .665], [10, .71, .69], [11, .65, .71], [12, .6, .733], [13, .56, .75], [14, .536, .767], [15.04, .534, .785]],
    // someone standing at the tower's base
    baseP: [[6, .927, .5], [7, .843, .515], [8, .77, .535], [9, .694, .537], [10, .625, .565], [11, .572, .572], [12, .517, .585], [13, .479, .595], [13.5, .47, .6]],
    // the portal: middle of its left pillar, middle of its second pillar, and the beam between them
    portalL: [[7, .925, .43], [8, .84, .41], [9, .766, .43], [10, .69, .46], [11, .64, .47], [12, .589, .477], [13, .55, .51], [14, .5275, .517], [15.04, .528, .525]],
    portalM: [[8, .975, .41], [9, .91, .43], [10, .823, .46], [11, .777, .47], [12, .73, .477], [13, .6875, .51], [14, .67, .517], [15.04, .665, .525]],
    beam: [[8, .9075, .232], [9, .838, .27], [10, .756, .29], [11, .71, .287], [12, .66, .285], [13, .62, .315], [14, .6, .32], [15.04, .597, .327]],
    // the left end of the wide steps in front of the portal
    steps: [[8, .76, .585], [9, .7, .61], [10, .6, .64], [11, .556, .65], [12, .5, .665], [13, .47, .675], [14, .45, .69], [15.04, .468, .7]],
    // the people who gather under the portal (their middle)
    group: [[9.6, .82, .56], [10, .79, .565], [11, .74, .578], [12, .705, .592], [13, .665, .612], [14, .64, .625], [15.04, .625, .635]],
    // people sitting on the amphitheatre behind the portal
    amph: [[9, .95, .42], [10, .93, .43], [11, .88, .46], [12, .84, .47], [13, .81, .48], [14, .79, .5], [15.04, .79, .51]],
  },
  // When a tracked thing is in the frame (seconds); outside, whatever is pinned to it fades.
  visible: {
    cliffTop: [0, 7.6], cliffPeople: [0, 7.2], blocks: [0, 7.4], sitter: [6.9, 99], baseP: [6.1, 13.3],
    portalL: [7.4, 99], portalM: [8.2, 99], beam: [8.2, 99], steps: [8.4, 99], group: [9.8, 99], amph: [9.3, 99],
  },
  world: 'door',            // a fixed thing in the scene: what is left behind moves with it
  sphereR: .037,            // the boulder's radius, fraction of the frame width
  climberBox: [.026, .065], // half width and half height of the woman, fractions of the frame (labels keep clear of her)
  // other people in the film, as [track, half width, half height]: the words keep clear of them too
  keepClear: [['sitter', .016, .035], ['baseP', .01, .04], ['group', .05, .045], ['cliffPeople', .022, .02]],

  // The sky over the film: one real constellation per station (sky.js; stars and figure lines in
  // data/constellations.json, sources in data/SOURCES.txt). Each first shows as seen from Earth; then,
  // through its station, the camera turns `yaw`/`pitch` degrees and the stars separate in depth.
  //   wide.at:     where the figure sits on wide screens, in frame fractions [x0, y0, x1, y1] at the
  //                station's moment, moving with the scene by `drift` (a share of FILM.world's motion);
  //   wide.box:    or a box pinned to a track, as offsets from it (the portal's beam);
  //   narrow.at:   on phones, fractions of the band between the rail and the dock;
  //   align:       where the figure sits inside its box (left, right, top, bottom; centred by default);
  //   names:       stars named on the chart besides those with a meaning (`role` in the data);
  //   keep:        draw only these stars and the lines between them (fewer lines, more air);
  //   tethers:     [star, track]: a thin line from that star down to someone in the film.
  sky: {
    src: 'data/constellations.json',
    distance: 6,          // the camera's distance from the figure, in sky units (the figure is 2 across)
    depth: 1.3,           // sky units of depth per e-fold of distance: real distances on a log scale
    dim: { wide: 0, narrow: 0 },       // the soft darkening of the film behind a figure (version 15: none, the sky stays quiet)
    lead: -.15,           // a figure arrives this many seconds of film before its station's moment (v14: .45). Version 15:
                          // just after it, so each floor's figure is still there while the floor's words are read
    // Version 15: wide.at keeps every figure in the film's open sky, right of the words (the frame's x .5–.86 is clear
    // of them at 1366–2560 px), and clear of the woman; anything placed further left is pushed out by the open area.
    stations: {
      absurd: { id: 'Boo', wide: { at: [.54, .04, .86, .44], drift: .25 }, narrow: { at: [.62, .04, .98, .78], align: 'right' },
        yaw: 12, pitch: -3, tethers: [['Arcturus', 'climber']] },
      'boulder-1': { id: 'CrB', wide: { at: [.54, .04, .86, .42], drift: .25 }, narrow: { at: [.48, .12, .98, .62], align: 'right' },
        yaw: -12, pitch: 2, tethers: [['Alphecca', 'cliffPeople']] },
      'boulder-2': { id: 'Cyg', wide: { at: [.52, .03, .84, .46], drift: .25 }, narrow: { at: [.56, .08, .98, .8], align: 'right' },
        yaw: 13, pitch: -2, tethers: [['Sadr', 'climber']] },
      'boulder-3': { id: 'Pleiades', wide: { at: [.54, .04, .84, .4], drift: .25 }, narrow: { at: [.5, .14, .98, .6], align: 'right' },
        yaw: -11, pitch: 3, tethers: [['Alcyone', 'climber']] },
      lever: { id: 'Lib', wide: { at: [.53, .03, .86, .4], drift: .2 }, narrow: { at: [.64, .12, .97, .9], align: 'right' },
        yaw: 12, pitch: -2, tethers: [['Zubenelgenubi', 'climber'], ['Zubeneschamali', 'baseP']] },
      path: { id: 'Cas', wide: { at: [.52, .04, .86, .4], drift: .2 }, narrow: { at: [.45, .14, .98, .56], align: 'right' },
        yaw: -12, pitch: 3, tethers: [['Segin', 'group']], maxNarrow: 4 },
      person: { id: 'Gem', wide: { at: [.52, .04, .86, .42], drift: .2 }, narrow: { at: [.5, .1, .98, .66], align: 'right' },
        yaw: 12, pitch: -3, tethers: [['Castor', 'climber'], ['Pollux', 'group']] },
      // Orion: the body and the belt (its club and shield are left out, for air)
      summit: { id: 'Ori', wide: { at: [.52, .03, .88, .46], drift: .2 }, narrow: { at: [.6, .08, .97, .84], align: 'right' },
        yaw: -13, pitch: 2, tethers: [['Alnilam', 'group']],
        keep: ['Betelgeuse', 'Bellatrix', 'Meissa', 'Mintaka', 'Alnilam', 'Alnitak', 'Saiph', 'Rigel', 'Eta Ori'] },
    },
  },
  maxNotes: { wide: 6, narrow: 3 },

  // Places in the film that answer a click: one line on hover, then a jump to that station.
  hotspots: [
    { id: 'climber', track: 'climber', go: 'person', title: 'Who is pushing', line: 'The person doing the work: an engineer and a sociologist.' },
    { id: 'sphere', track: 'sphere', go: 'boulder-1', push: true, title: 'The boulder', line: 'The same work, uphill, every week.', hint: 'Click: three boulders · Hold: push' },
    { id: 'cliff', track: 'cliffTop', go: 'boulder-1', to: 6, title: 'The cliff', line: 'Questions, and the people who answer them.' },
    { id: 'door', track: 'door', go: 'boulder-2', from: 3.2, to: 12.5, title: 'The door', line: 'One way in; every floor keeps its own session.' },
    { id: 'portal', track: 'beam', go: 'lever', from: 8.6, title: 'The portal', line: 'Two pillars and one beam: the seam.' },
    { id: 'steps', track: 'steps', go: 'path', from: 9.6, dx: .1, title: 'The steps', line: 'Diagnose, specify, build, hand over.' },
    { id: 'group', track: 'group', go: 'summit', from: 10.6, title: 'The people', line: 'The ones who keep using it, after the handover.' },
  ],

  // Version 15: the film talks to the page (tethers.js). A thin line leaves the film at a thing in it and ties it to
  // the words on the left that stand for it ([data-tether] in the page). Per thing:
  //   track: the thing in the film; up / dx: where on it the line starts (frame fractions: over a head, the top of
  //          the boulder); stars: or stars of the sky's figure (sky.js), one per word, with a track to fall back on;
  //   at:    its moment (seconds): hovering or focusing its words eases the film there;
  //   title: what the film calls it, written beside it while its words are hovered;
  //   spot:  the hotspot over the same thing (hovering it lights the words too);
  //   star / data-node: when the thing is out of the film's open part at its floor (off the frame's edge, or under
  //          the words), the line leaves from the sky's star (or segment) with the same meaning instead (skyAt: the
  //          moment to ease to for it). The thing in the film always comes first when it is in the open.
  tethers: {
    max: { wide: 4, narrow: 2 },
    nodes: {
      // version 17: every line leaves from the sky first, the figure's star (or segment) with the words' meaning
      woman: { track: 'climber', up: .064, at: 0, title: 'Who is pushing', spot: 'climber', star: 'Arcturus', prefer: 'sky' },
      sphere: { track: 'sphere', up: .068, at: 2.5, title: 'The boulder', spot: 'sphere' },
      published: { star: 'Alphecca', prefer: 'sky', at: 2.5, title: 'v3 · published' },
      door: { track: 'door', at: 4.5, title: 'The door', spot: 'door', star: 'Sadr', skyAt: 5.6, prefer: 'sky' },
      sitter: { track: 'sitter', up: .042, at: 7.6, title: 'The reviewer', star: 'Alcyone', skyAt: 7.7, prefer: 'sky' },
      portal: { track: 'portalL', up: .1, at: 9.2, title: 'The portal', spot: 'portal', skyAt: 9.7, prefer: 'sky' },
      steps: { track: 'steps', dx: .1, at: 10.5, title: 'The steps', spot: 'steps', skyAt: 11.7, prefer: 'sky' },
      group: { track: 'group', up: .055, at: 12.5, title: 'The people', spot: 'group', skyAt: 13.6, prefer: 'sky' },
      belt: { stars: ['Mintaka', 'Alnilam', 'Alnitak'], prefer: 'sky', track: 'group', up: .055, spread: .035, at: 14.95, title: 'Orion’s belt' },
    },
  },

  stills: [0, .3, .6, .95],                          // reduced motion: video/woman-still-1…4.jpg, as fractions of the film
  stillFor: [0, 1, 1, 2, 2, 2, 3, 3],                // reduced motion: the still each station shows, so its tethered thing is in it
  halfStills: null,                                  // reduced motion: the half's own stills, only with halfCrop
  portraitCrop: { from: 0.47, to: 0.52, width: 0.6458 },   // mirrors the band encode's panning crop (1240 / 1920 of the frame)
  narrowFocusY: '60%',                               // where the band crops vertically (phones show the whole height)
  slip: { idle: 4000, back: 0.6, duration: 1500 },   // stop scrolling and the boulder rolls back, never past a checkpoint
  narrowCaption: { x: 0.5, y: 0.2 },
  drag: { secondsPerWidth: 7, friction: 3.2 },       // dragging the film: seconds per full width, then inertia
  push: { speed: 1.25, ramp: .6, hold: 260, back: 900 },   // hold the boulder: film seconds per second; release eases back (ms)
  placeholder: false,
};
