// Yeh hamari "database" hai (abhi ke liye).
// Har restaurant ek object hai. "slug" ek unique URL-friendly naam hai
// (jaise Android mein Intent extras ke sath ek ID pass karte hain,
// yahan hum slug use karte hain URL mein: /restaurant/karachi-broast)

export const restaurants = [
  {
    slug: 'karachi-broast',
    name: 'Karachi Broast',
    cuisine: 'Fast Food',
    floor: 'Ground Floor',
    tagline: 'Crispy broast, since forever.',
    logo: '',
    menu: [
      {
        category: 'Broast',
        items: [
          { name: 'Full Broast (4 pcs)', price: 950 },
          { name: 'Half Broast (2 pcs)', price: 520 },
          { name: 'Broast Burger', price: 380 },
        ],
      },
      {
        category: 'Sides',
        items: [
          { name: 'Fries (Regular)', price: 220 },
          { name: 'Coleslaw', price: 150 },
        ],
      },
    ],
  },
  {
    slug: 'punjabi-tikka-house',
    name: 'Punjabi Tikka House',
    cuisine: 'Desi / BBQ',
    floor: '1st Floor',
    tagline: 'Charcoal grilled, Punjab style.',
    logo: '',
    menu: [
      {
        category: 'BBQ',
        items: [
          { name: 'Chicken Tikka (Full)', price: 650 },
          { name: 'Seekh Kabab (4 pcs)', price: 480 },
          { name: 'Malai Boti (Half)', price: 420 },
        ],
      },
      {
        category: 'Breads',
        items: [
          { name: 'Naan', price: 60 },
          { name: 'Roghni Naan', price: 90 },
        ],
      },
    ],
  },
  {
    slug: 'pizza-point',
    name: 'Pizza Point',
    cuisine: 'Italian / Fast Food',
    floor: '1st Floor',
    tagline: 'Hot, cheesy, straight from the oven.',
    logo: '',
    menu: [
      {
        category: 'Pizzas',
        items: [
          { name: 'Chicken Tikka Pizza (Medium)', price: 890 },
          { name: 'Fajita Pizza (Medium)', price: 850 },
          { name: 'Cheese Lovers (Medium)', price: 790 },
        ],
      },
      {
        category: 'Sides',
        items: [
          { name: 'Garlic Bread', price: 280 },
          { name: 'Wings (6 pcs)', price: 450 },
        ],
      },
    ],
  },
  {
    slug: 'sargodha-chai-wala',
    name: 'Sargodha Chai Wala',
    cuisine: 'Tea / Snacks',
    floor: 'Ground Floor',
    tagline: 'Doodh patti that hits different.',
    logo: '',
    menu: [
      {
        category: 'Chai',
        items: [
          { name: 'Doodh Patti', price: 120 },
          { name: 'Kashmiri Chai', price: 180 },
        ],
      },
      {
        category: 'Snacks',
        items: [
          { name: 'Samosa (2 pcs)', price: 80 },
          { name: 'Pakora Plate', price: 150 },
        ],
      },
    ],
  },
]
