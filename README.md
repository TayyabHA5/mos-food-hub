# MOS Food Hub

Mall of Sargodha ke sab restaurants aur unke menus ek jagah — sirf ek QR
code scan kar ke.

## Apne computer pe chalane ka tareeqa

1. [Node.js](https://nodejs.org) install karein (agar pehle se nahi hai) — LTS version le lein.
2. Yeh folder kisi bhi jagah extract/rakh dein.
3. Terminal (ya VS Code ka terminal) us folder mein khol kar yeh commands chalayein:

```bash
npm install
npm run dev
```

4. Browser mein `http://localhost:3000` khol lein — website chal jayegi.

Jab code mein koi tabdeeli karenge (koi bhi file save karenge), page
automatically refresh ho jayega — dobara command chalane ki zaroorat nahi.

## Folder Structure (Android se comparison ke sath)

```
mos-food-hub/
├── app/                          → Android ke "app/src/main" jaisa
│   ├── layout.js                 → poori app ka wrapper (Manifest + base theme jaisa)
│   ├── globals.css               → global styling (styles.xml jaisa)
│   ├── page.js                   → HOME PAGE ("/" route) — restaurant list
│   └── restaurant/
│       └── [slug]/
│           └── page.js           → ek dynamic page jo HAR restaurant ke liye
│                                    kaam karti hai (Activity + Intent extra jaisa)
│
├── data/
│   └── restaurants.js            → sab restaurants aur menu ka data
│                                    (abhi ke liye "database" yahi hai)
│
├── public/                       → images/static files yahan rakhein
│                                    (Android ke "res/drawable" jaisa)
│
├── package.json                  → project ki dependencies ki list
│                                    (build.gradle jaisa)
├── tailwind.config.js            → colors, fonts, spacing settings
├── postcss.config.js             → Tailwind ko kaam karne ke liye zaroori
└── next.config.js                → Next.js ki settings
```

## Naya restaurant add karna

`data/restaurants.js` file kholein aur is jaisa ek naya object array mein
add kar dein:

```js
{
  slug: 'restaurant-ka-unique-naam',   // URL mein use hoga, spaces na hon
  name: 'Restaurant Ka Naam',
  cuisine: 'Fast Food',
  floor: 'Ground Floor',
  tagline: 'Ek line mein tareef.',
  menu: [
    {
      category: 'Category Ka Naam',
      items: [
        { name: 'Item Ka Naam', price: 500 },
      ],
    },
  ],
},
```

Bas — save karein, website apne aap update ho jayegi. Koi backend/database
setup nahi karna abhi.

## Agla step (jab yeh comfortable ho jaye)

- Restaurant logos/photos `public/` folder mein daal kar dikhana
- Data ko Firebase Firestore mein move karna (taake aap phone se bhi
  edit kar sakein, code kholne ki zaroorat na ho)
- Vercel pe deploy karna taake asal QR code se live website khule

## Deploy kaise karein (jab ready ho)

1. Is code ko GitHub pe push karein.
2. [vercel.com](https://vercel.com) pe GitHub se login karein.
3. Repo import karein — Vercel automatically Next.js detect kar ke deploy
   kar dega.
4. Milne wale URL (jaise `mos-food-hub.vercel.app`) ko QR code mein daal
   dein.
