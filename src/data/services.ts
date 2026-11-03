// Copy for the four service pages, carried over from the live WordPress pages.
export type Section =
  | { kind: 'list'; title: string; items: (string | [string, string])[]; note?: string }
  | { kind: 'timeline'; title: string; items: [string, string][]; note?: string }
  | { kind: 'text'; title: string; body: string[] };

export interface Service {
  path: string;
  name: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  intro: string;
  hero: string;
  heroAlt: string;
  lede: string[];
  sections: Section[];
  gallery: [string, string][];
  areasTitle: string;
  areas: string;
  related: { label: string; href: string }[];
}

export const services: Record<string, Service> = {
  kitchens: {
    path: '/kitchen-remodeling-nashville/',
    name: 'Kitchen Remodeling',
    seoTitle: 'Kitchen Remodeling Nashville, TN | Tom Bell Cabinetry',
    seoDescription: 'Full kitchen remodels in Nashville with cabinetry built in our own shop. Realistic timelines, honest budgets, one crew start to finish. (615) 469-2781.',
    h1: 'Kitchen Remodeling in Nashville, TN',
    intro: 'The cabinetry stays in-house: designed, built and installed by one crew out of our Madison shop. Fewer handoffs, fewer surprises, and one company that owns the outcome.',
    hero: '/img/kitchen.webp',
    heroAlt: 'Walnut kitchen island with a farmhouse sink, built by Tom Bell Cabinetry',
    lede: [
      "A kitchen remodel goes sideways in predictable ways: the cabinets arrive wrong, the installer isn't the person who measured, and nobody owns the problem. We avoid most of that by keeping the cabinetry in-house, designed, built and installed by our own crew out of our Madison, TN shop.",
    ],
    sections: [
      { kind: 'list', title: 'What a remodel with us includes', items: [
        'Design and layout planning, including moving walls or reworking the work triangle',
        'Custom cabinetry built for your exact room',
        'Countertop coordination: quartz, granite, marble, butcher block',
        'Islands, pantries and range hood surrounds',
        'Trim, panels and finish carpentry to tie it together',
        'Coordination with your electrician, plumber and tile installer',
      ] },
      { kind: 'timeline', title: 'A realistic timeline', items: [
        ['Weeks 1 to 2', 'Consultation, measure, design and budget'],
        ['Weeks 3 to 4', 'Selections finalized, drawings approved, materials ordered'],
        ['Weeks 4 to 10', 'Cabinetry built in our shop while demo and rough-in happen at your house'],
        ['Weeks 10 to 12', 'Cabinet install, countertop template and set, backsplash, hardware, punch list'],
      ], note: "Most full kitchens land in the 10 to 14 week range from signed design to finished room. Structural changes or long-lead appliances push that out, and we'll say so up front rather than discover it later." },
      { kind: 'text', title: 'Budgeting honestly', body: [
        "Cabinetry is usually 35 to 50 percent of a kitchen budget. That's the number that determines whether the room feels custom or feels close. We'd rather scope a smaller project done properly than stretch a budget across a kitchen that ends up compromised in every category.",
      ] },
      { kind: 'text', title: 'Older Nashville homes', body: [
        'Sloped floors, plaster walls, out-of-square corners, and 1920s framing that ignores modern cabinet dimensions. Custom-built cabinetry scribed on site handles this. Stock boxes and filler strips do not.',
      ] },
    ],
    gallery: [
      ['vaulted', 'Vaulted kitchen with white cabinetry and a walnut island'],
      ['g2', 'Vaulted white kitchen with a walnut island'],
      ['g11', 'Walnut kitchen run with long drawers'],
      ['g12', 'Walnut island with an open shelf base'],
      ['p-fa7e9889', 'Laundry built-ins with a stacked washer and dryer'],
    ],
    areasTitle: 'Areas we serve',
    areas: 'Nashville, Madison, East Nashville, Green Hills, 12 South, Belle Meade, Brentwood, Franklin, Hendersonville, Mount Juliet, Gallatin, Nolensville, and Middle Tennessee within about 50 miles of the shop.',
    related: [
      { label: 'Custom cabinets', href: '/custom-cabinets-nashville/' },
      { label: 'Custom built-ins', href: '/custom-built-ins-nashville/' },
    ],
  },

  cabinets: {
    path: '/custom-cabinets-nashville/',
    name: 'Custom Cabinets',
    seoTitle: 'Custom Cabinets Nashville, TN | Tom Bell Cabinetry',
    seoDescription: 'Custom cabinets built in our Nashville-area shop by our own crew. Solid wood, plywood boxes, no imported flat-pack. Free estimate: (615) 469-2781.',
    h1: 'Custom Cabinets in Nashville, TN',
    intro: 'Built in our Madison, TN shop by our own crew, not ordered from a catalog and shipped in a box.',
    hero: '/img/g10.webp',
    heroAlt: 'Tall walnut cabinet wall in a downtown high-rise',
    lede: [
      'Most of what gets sold as "custom cabinetry" in Nashville isn\'t. It\'s a catalog order: cabinet boxes manufactured overseas to fixed sizes, shipped to a warehouse, and installed by a crew that never touched a saw. Filler strips hide the gaps. The finish is a photograph of wood grain.',
      'Tom Bell Cabinetry works the other way. We build cabinets in our Madison, TN shop, using our own crew, for homes across Nashville and Middle Tennessee. Your kitchen gets measured, drawn, cut, assembled, finished and installed by the same people. If something needs to change mid-project, we change it, because the shop is fifteen minutes away rather than fifteen time zones.',
    ],
    sections: [
      { kind: 'list', title: 'What "custom" actually means here', items: [
        ['Built to your dimensions', 'Not the nearest 3-inch increment with a filler panel to cover the difference.'],
        ['The right material for each part', 'Solid hardwood face frames, stained doors and drawer fronts in maple, white oak, cherry or walnut, and high-density fiberboard where it outperforms wood, like painted panels that need to stay flat.'],
        ['Plywood boxes', 'Furniture-grade, not particleboard that swells the first time a dishwasher leaks.'],
        ['Dovetailed drawer boxes', 'With full-extension soft-close hardware.'],
        ['Finished in our shop', 'Under controlled conditions, so the color is consistent across every door.'],
      ] },
      { kind: 'text', title: 'What we build', body: [
        "Kitchen cabinetry, islands, pantries, bathroom vanities, laundry and mudroom storage, built-in bookcases and window seats, home office and library millwork, bars and butler's pantries, and range hood surrounds.",
      ] },
      { kind: 'list', title: 'How the process runs', items: [
        ['Consultation', 'We walk the space, talk through how you actually use it, and give you a realistic budget range before anyone commits.'],
        ['Design and drawings', 'You see elevations and a materials list. Nothing is ordered until you sign off.'],
        ['Field measure', 'We measure the room as it exists, not as the plans say it should be. Nashville has a lot of old houses and very few square corners.'],
        ['Build', 'Your cabinetry is made in our shop, typically over four to eight weeks depending on scope and finish.'],
        ['Install', 'Our own crew sets and scribes everything to the walls, then handles trim, hardware and punch list.'],
      ] },
      { kind: 'text', title: 'Custom vs. stock: the honest version', body: [
        "Stock cabinets are cheaper. If your kitchen is a simple rectangle with standard ceiling heights and you're selling in two years, stock may be the right call, and we'll tell you so. Custom earns its cost when the room is irregular, when ceilings are tall, when you need storage designed around specific things, or when you plan to keep the house and want cabinetry that outlives the trend cycle.",
      ] },
    ],
    gallery: [
      ['cabinets', 'Custom vanity with a tall walnut linen cabinet'],
      ['g4', 'Walnut bar cabinet with pull-out drawers'],
      ['g6', 'Solid wood drawer boxes with dovetail joinery'],
      ['g8', 'Black double vanity with arched mirrors'],
      ['g5', 'Open walnut vanity under a window'],
    ],
    areasTitle: 'Where we work',
    areas: 'Our shop is in Madison, TN, and we serve homes within roughly 50 miles of Nashville, including Brentwood, Franklin, Belle Meade, Green Hills, East Nashville, 12 South, Hendersonville, Mount Juliet, Gallatin and Nolensville.',
    related: [
      { label: 'Custom millwork', href: '/custom-millwork-nashville/' },
      { label: 'Built-in cabinetry', href: '/custom-built-ins-nashville/' },
    ],
  },

  millwork: {
    path: '/custom-millwork-nashville/',
    name: 'Custom Millwork',
    seoTitle: 'Custom Millwork Nashville, TN | Tom Bell Cabinetry',
    seoDescription: 'Architectural millwork, custom trim, paneling, built-ins and stair parts for Nashville homes. Historic profile matching. Call (615) 469-2781.',
    h1: 'Custom Millwork in Nashville, TN',
    intro: "Trim, paneling, built-ins and stair parts milled in our own shop. We can match a historic profile that hasn't been sold off the shelf since 1935, so an addition never announces itself.",
    hero: '/img/millwork.webp',
    heroAlt: 'Slatted wood ceiling detail',
    lede: [
      'Millwork is the difference between a room that looks finished and a room that looks assembled. Crown that dies cleanly into a beam. Paneled wainscot that lines up with the door casing. A stair rail that feels right in the hand. These are the details people notice without knowing why.',
      'Tom Bell Cabinetry builds architectural millwork in our Madison, TN shop for homes, historic renovations and light commercial projects across Nashville and Middle Tennessee.',
    ],
    sections: [
      { kind: 'list', title: 'What we produce', items: [
        ['Trim and moulding', 'Crown, base, casing, chair rail, picture rail, and custom knife profiles to match an existing house.'],
        ['Wall paneling', 'Raised panel, flat panel, board and batten, shiplap, wainscot.'],
        ['Built-ins', 'Bookcases, window seats, banquettes, entertainment walls, mudroom lockers.'],
        ['Interior doors and jambs', 'Including non-standard sizes for older homes.'],
        ['Stair parts', 'Treads, risers, newels, balustrade, skirt boards.'],
        ['Mantels, columns, coffered and beamed ceilings', ''],
        ['Commercial casework', 'Reception desks, retail fixtures, office built-ins.'],
      ] },
      { kind: 'text', title: 'Matching historic profiles', body: [
        "Nashville has a lot of houses built between 1900 and 1940, and almost none of their trim profiles are available off the shelf. We can take a sample piece of your existing moulding, grind a custom knife, and run new material that matches, so an addition or a repair doesn't announce itself.",
      ] },
      { kind: 'text', title: 'Species and finishes', body: [
        'Poplar and MDF for paint-grade work. White oak, maple, cherry, walnut and mahogany for stain-grade. We finish in the shop, which means even color and no fumes in your house for a week.',
      ] },
      { kind: 'text', title: 'Who we work with', body: [
        "Homeowners directly, and also architects, interior designers and general contractors who need a shop that will actually hit the drawing. We're comfortable working from a spec set, and equally comfortable helping figure out the detail when there isn't one yet.",
      ] },
    ],
    gallery: [
      ['g9', 'Walnut-paneled room with a glass door'],
      ['g14', 'Wood slat ceiling detail'],
      ['g1', 'Walnut library with arched shelving'],
      ['g7', 'Walnut-paneled room with black steel windows'],
      ['p-612598200301335177', 'Custom sliding barn door in reclaimed wood'],
    ],
    areasTitle: 'Service area',
    areas: 'Nashville, Madison, Brentwood, Franklin, Belle Meade, Green Hills, Hendersonville, Mount Juliet, Gallatin, Nolensville, and the surrounding Middle Tennessee area, roughly a 50-mile radius of our shop.',
    related: [
      { label: 'Custom cabinetry', href: '/custom-cabinets-nashville/' },
      { label: 'Built-in work', href: '/custom-built-ins-nashville/' },
    ],
  },

  builtins: {
    path: '/custom-built-ins-nashville/',
    name: 'Custom Built-Ins',
    seoTitle: 'Custom Built-Ins Nashville, TN | Tom Bell Cabinetry',
    seoDescription: 'Custom built-ins for Nashville homes: bookcases, mudroom lockers, window seats, home offices and pantries. Scribed to fit. Call (615) 469-2781.',
    h1: 'Custom Built-Ins in Nashville, TN',
    intro: 'Bookcases, mudroom lockers, window seats, pantries and vanities, scribed to walls that are rarely square. There is no off-the-shelf version of the wall you actually have.',
    hero: '/img/builtins.webp',
    heroAlt: 'Walnut wall unit with open shelving and media storage',
    lede: [
      "Built-ins are where custom work pays off most obviously. There is no off-the-shelf version of a bookcase that fits a 94-inch wall under a sloped ceiling, or a mudroom locker sized for your family's actual coats and cleats. We build these in our Madison, TN shop and install them across Nashville and Middle Tennessee.",
    ],
    sections: [
      { kind: 'list', title: 'What we build', items: [
        ['Living room built-ins', 'Bookcases, media walls, fireplace surrounds and flanking cabinets.'],
        ['Home offices', 'Desks, file storage, floor-to-ceiling shelving, library walls.'],
        ['Mudrooms and entryways', 'Lockers, benches, cubbies, coat storage.'],
        ['Window seats and banquettes', 'With lift-top or drawer storage.'],
        ["Pantries and butler's pantries", 'With pull-outs and appliance garages.'],
        ['Closets and dressing rooms', 'Built like furniture rather than wire shelving.'],
        ['Bunk rooms, under-stair storage and attic knee-wall cabinets', ''],
      ] },
      { kind: 'text', title: 'Built to the wall, not near it', body: [
        "Every piece is field-measured and scribed on install, so it meets the ceiling and the baseboard without a gap. In an older Nashville house where nothing is plumb, that's the whole difference between built-in and pushed-against.",
      ] },
      { kind: 'text', title: 'Materials', body: [
        "Paint-grade poplar and MDF, or stain-grade white oak, maple, cherry and walnut. Plywood carcasses, adjustable solid shelving that won't sag, integrated lighting where it makes sense, and shop-applied finish.",
      ] },
    ],
    gallery: [
      ['library', 'Walnut library built-ins with a chandelier'],
      ['g3', 'Walnut media wall with carved panel doors'],
      ['g13', 'Built-in shelving detail'],
      ['g10', 'Tall walnut storage wall'],
      ['p-71d73b14', 'Walnut kitchen and pantry built-ins'],
    ],
    areasTitle: 'Service area',
    areas: 'Nashville, Madison, Brentwood, Franklin, Belle Meade, Green Hills, East Nashville, Hendersonville, Mount Juliet, Gallatin, Nolensville, and the surrounding area within roughly 50 miles.',
    related: [
      { label: 'Custom cabinetry', href: '/custom-cabinets-nashville/' },
      { label: 'Architectural millwork', href: '/custom-millwork-nashville/' },
    ],
  },
};
