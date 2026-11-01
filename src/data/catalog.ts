export type Language = 'ar' | 'en';

export type PageRoute =
  | { page: 'home' }
  | { page: 'shop'; collectionFilter?: string }
  | { page: 'collection'; slug: string }
  | { page: 'product'; slug: string; id?: string }
  | { page: 'cart' }
  | { page: 'checkout' }
  | { page: 'order-confirmation'; orderRef: string }
  | { page: 'login'; redirectAfter?: string }
  | { page: 'account' }
  | { page: 'admin'; subview?: 'orders' | 'order-detail' | 'products' | 'settings' | 'notifications'; orderId?: string }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'privacy' }
  | { page: 'terms' }
  | { page: 'shipping' };

export interface Product {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  currency: string;
  category_ar: string;
  category_en: string;
  image: string;
  secondary_image?: string;
  size_ar?: string;
  size_en?: string;
  orientation_ar?: string;
  orientation_en?: string;
  frame_ar?: string;
  frame_en?: string;
  quantity_per_set_ar?: string;
  quantity_per_set_en?: string;
  seo_title_ar?: string;
  seo_title_en?: string;
  seo_description_ar?: string;
  seo_description_en?: string;
  alt_ar?: string;
  alt_en?: string;
  status: 'published' | 'draft';
}

export interface CollectionPlaceholder {
  id: string;
  slug: string;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  description: { ar: string; en: string };
  curationNote: { ar: string; en: string };
  image: string;
  isPlaceholder: true;
}

export const BRAND_ASSETS = {
  heroGallery: '/src/assets/images/hero_automotive_gallery_1793368162924.jpg',
  sportsCars: '/src/assets/images/collection_sports_cars_1793368164347.jpg',
  luxuryIcons: '/src/assets/images/collection_luxury_icons_1793368165583.jpg',
  speedLegends: '/src/assets/images/collection_speed_legends_1793368166596.jpg',
  interiorShowcase: '/src/assets/images/experience_interior_showcase_1793368168289.jpg',
};

export const PRODUCT_IMAGES = {
  supra: '/images/products/toyota_supra_mk4_graffiti.webp',
  e46Devil: '/images/products/bmw_e46_devil.webp',
  porscheYellow: '/images/products/porsche_911_gt3_rs_yellow.webp',
  porscheDark: '/images/products/porsche_911_gt3_rs_dark.webp',
  ferrariSP3: '/images/products/ferrari_daytona_sp3.webp',
};

/**
 * THE 5 REAL PRODUCTS FOR VELTOR
 * Category: Framed Automotive Posters / لوحات سيارات بإطار
 */
export const REAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01-supra',
    slug: 'toyota-supra-mk4-graffiti-poster',
    name_ar: 'لوحة تويوتا سوبرا MK4 – جرافيتي سماوي',
    name_en: 'Toyota Supra MK4 – Cyan Graffiti Framed Poster',
    description_ar:
      'لوحة بتصميم جرافيتي نابض بدرجات السماوي، تتوسطها تويوتا سوبرا MK4 في مشهد ليلي حضري. إطار أسود أنيق ومقاس عمودي 20×30 سم.',
    description_en:
      'A vibrant cyan graffiti design featuring the Toyota Supra MK4 in an urban night scene, presented in a black frame measuring 20×30 cm in portrait orientation.',
    price: 499,
    currency: 'EGP',
    category_ar: 'لوحات سيارات بإطار',
    category_en: 'Framed Automotive Posters',
    image: PRODUCT_IMAGES.supra,
    secondary_image: BRAND_ASSETS.heroGallery,
    size_ar: '20×30 سم',
    size_en: '20×30 cm',
    orientation_ar: 'عمودي',
    orientation_en: 'Vertical',
    frame_ar: 'أسود',
    frame_en: 'Black',
    quantity_per_set_ar: 'قطعة واحدة',
    quantity_per_set_en: '1 piece',
    seo_title_ar: 'لوحة تويوتا سوبرا MK4 – جرافيتي سماوي | VELTOR',
    seo_title_en: 'Toyota Supra MK4 – Cyan Graffiti Framed Poster | VELTOR',
    seo_description_ar:
      'لوحة بتصميم جرافيتي نابض بدرجات السماوي، تتوسطها تويوتا سوبرا MK4 في مشهد ليلي حضري.',
    seo_description_en:
      'A vibrant cyan graffiti design featuring the Toyota Supra MK4 in an urban night scene.',
    alt_ar: 'لوحة فنية مؤطرة لتويوتا سوبرا MK4 بخلفية جرافيتي سماوي ليلي',
    alt_en: 'Framed automotive art poster of Toyota Supra MK4 with cyan graffiti in urban night scene',
    status: 'published',
  },
  {
    id: 'prod-02-bmw-e46',
    slug: 'bmw-e46-devil-poster',
    name_ar: 'لوحة بي إم دبليو E46 – DEVIL',
    name_en: 'BMW E46 "Devil" Framed Poster – Black & Red',
    description_ar:
      'لوحة داكنة تبرز بي إم دبليو E46 بعيون حمراء مضيئة وخط "DEVIL" الأحمر الجريء. إطار أسود ومقاس عمودي حوالي 20×30 سم.',
    description_en:
      'A dark BMW E46 artwork featuring glowing red eyes and bold red "DEVIL" lettering, presented in a black frame measuring approximately 20×30 cm in portrait orientation.',
    price: 499,
    currency: 'EGP',
    category_ar: 'لوحات سيارات بإطار',
    category_en: 'Framed Automotive Posters',
    image: PRODUCT_IMAGES.e46Devil,
    secondary_image: BRAND_ASSETS.heroGallery,
    size_ar: 'حوالي 20×30 سم',
    size_en: 'Approximately 20×30 cm',
    orientation_ar: 'عمودي',
    orientation_en: 'Vertical',
    frame_ar: 'أسود',
    frame_en: 'Black',
    quantity_per_set_ar: 'قطعة واحدة',
    quantity_per_set_en: '1 piece',
    seo_title_ar: 'لوحة بي إم دبليو E46 – DEVIL | VELTOR',
    seo_title_en: 'BMW E46 "Devil" Framed Poster – Black & Red | VELTOR',
    seo_description_ar:
      'لوحة داكنة تبرز بي إم دبليو E46 بعيون حمراء مضيئة وخط "DEVIL" الأحمر الجريء.',
    seo_description_en:
      'A dark BMW E46 artwork featuring glowing red eyes and bold red "DEVIL" lettering.',
    alt_ar: 'لوحة فنية مؤطرة لسيارة بي إم دبليو E46 بتصميم DEVIL وأضواء حمراء',
    alt_en: 'Framed automotive poster of BMW E46 Devil with glowing red angel eyes and bold red typography',
    status: 'published',
  },
  {
    id: 'prod-03-porsche-yellow',
    slug: 'porsche-911-gt3-rs-yellow-poster',
    name_ar: 'لوحة بورش 911 GT3 RS الصفراء',
    name_en: 'Porsche 911 GT3 RS – Yellow Framed Poster',
    description_ar:
      'لوحة بورش 911 GT3 RS بدرجات الأصفر مع رقم 911 الأحمر الكبير في الخلفية. إطار أسود ومقاس عمودي 30×40 سم.',
    description_en:
      'A yellow-toned Porsche 911 GT3 RS artwork featuring a large red 911 number in the background, presented in a black frame measuring 30×40 cm in portrait orientation.',
    price: 499,
    currency: 'EGP',
    category_ar: 'لوحات سيارات بإطار',
    category_en: 'Framed Automotive Posters',
    image: PRODUCT_IMAGES.porscheYellow,
    secondary_image: BRAND_ASSETS.heroGallery,
    size_ar: '30×40 سم',
    size_en: '30×40 cm',
    orientation_ar: 'عمودي',
    orientation_en: 'Vertical',
    frame_ar: 'أسود',
    frame_en: 'Black',
    quantity_per_set_ar: 'قطعة واحدة',
    quantity_per_set_en: '1 piece',
    seo_title_ar: 'لوحة بورش 911 GT3 RS الصفراء | VELTOR',
    seo_title_en: 'Porsche 911 GT3 RS – Yellow Framed Poster | VELTOR',
    seo_description_ar:
      'لوحة بورش 911 GT3 RS بدرجات الأصفر مع رقم 911 الأحمر الكبير في الخلفية.',
    seo_description_en:
      'A yellow-toned Porsche 911 GT3 RS artwork featuring a large red 911 number in the background.',
    alt_ar: 'لوحة فنية مؤطرة لسيارة بورش 911 GT3 RS الصفراء مع رقم 911 وشعار بورش',
    alt_en: 'Framed automotive art poster of yellow Porsche 911 GT3 RS on bold yellow backdrop with Porsche crest',
    status: 'published',
  },
  {
    id: 'prod-04-porsche-dark',
    slug: 'porsche-911-gt3-rs-dark-poster',
    name_ar: 'لوحة بورش 911 GT3 RS – رمادي داكن',
    name_en: 'Porsche 911 GT3 RS – Dark Grey Framed Poster',
    description_ar:
      'تصميم داكن ومينيمالي يجمع اسم PORSCHE وطراز 911 GT3 RS بخطوط مائلة مع سيارة بلون الفحم داخل إطار أسود.',
    description_en:
      'A dark, minimalist design combining PORSCHE lettering and the 911 GT3 RS model name in diagonal typography, featuring a charcoal-colored car inside a black frame.',
    price: 550,
    currency: 'EGP',
    category_ar: 'لوحات سيارات بإطار',
    category_en: 'Framed Automotive Posters',
    image: PRODUCT_IMAGES.porscheDark,
    secondary_image: BRAND_ASSETS.heroGallery,
    // Size is unknown: leave empty and hide in storefront until supplied!
    size_ar: '',
    size_en: '',
    orientation_ar: 'عمودي',
    orientation_en: 'Vertical',
    frame_ar: 'أسود',
    frame_en: 'Black',
    quantity_per_set_ar: 'قطعة واحدة',
    quantity_per_set_en: '1 piece',
    seo_title_ar: 'لوحة بورش 911 GT3 RS – رمادي داكن | VELTOR',
    seo_title_en: 'Porsche 911 GT3 RS – Dark Grey Framed Poster | VELTOR',
    seo_description_ar:
      'تصميم داكن ومينيمالي يجمع اسم PORSCHE وطراز 911 GT3 RS بخطوط مائلة مع سيارة بلون الفحم داخل إطار أسود.',
    seo_description_en:
      'A dark, minimalist design combining PORSCHE lettering and the 911 GT3 RS model name in diagonal typography.',
    alt_ar: 'لوحة فنية مؤطرة لسيارة بورش 911 GT3 RS الرمادية الداكنة بلمسات حمراء',
    alt_en: 'Framed automotive art poster of dark grey Porsche 911 GT3 RS with red aero wing accents',
    status: 'published',
  },
  {
    id: 'prod-05-ferrari-sp3',
    slug: 'ferrari-daytona-sp3-poster',
    name_ar: 'لوحة فيراري ديتونا SP3',
    name_en: 'Ferrari Daytona SP3 – Framed Poster',
    description_ar:
      'لوحة بحرف FERRARI الكبير وفيراري ديتونا SP3 الحمراء في المقدمة. إطار أسود ومقاس عمودي 30×40 سم.',
    description_en:
      'An automotive artwork featuring large FERRARI lettering with the red Ferrari Daytona SP3 prominently displayed in the foreground, presented in a black frame measuring 30×40 cm in portrait orientation.',
    price: 499,
    currency: 'EGP',
    category_ar: 'لوحات سيارات بإطار',
    category_en: 'Framed Automotive Posters',
    image: PRODUCT_IMAGES.ferrariSP3,
    secondary_image: BRAND_ASSETS.heroGallery,
    size_ar: '30×40 سم',
    size_en: '30×40 cm',
    orientation_ar: 'عمودي',
    orientation_en: 'Vertical',
    frame_ar: 'أسود',
    frame_en: 'Black',
    quantity_per_set_ar: 'قطعة واحدة',
    quantity_per_set_en: '1 piece',
    seo_title_ar: 'لوحة فيراري ديتونا SP3 | VELTOR',
    seo_title_en: 'Ferrari Daytona SP3 – Framed Poster | VELTOR',
    seo_description_ar:
      'لوحة بحرف FERRARI الكبير وفيراري ديتونا SP3 الحمراء في المقدمة.',
    seo_description_en:
      'An automotive artwork featuring large FERRARI lettering with the red Ferrari Daytona SP3 prominently displayed in the foreground.',
    alt_ar: 'لوحة فنية مؤطرة لسيارة فيراري ديتونا SP3 الحمراء بخلفية FERRARI العمودية',
    alt_en: 'Framed automotive art poster of red Ferrari Daytona SP3 with bold vertical FERRARI typography',
    status: 'published',
  },
];

export const SAMPLE_PRODUCTS = REAL_PRODUCTS;

export const COLLECTIONS: CollectionPlaceholder[] = [
  {
    id: 'col-sports',
    slug: 'sports-cars',
    title: {
      ar: 'السيارات الرياضية',
      en: 'Sports Cars',
    },
    subtitle: {
      ar: 'خطوط انسيابية وهندسة صُممت للأداء العالي',
      en: 'Aerodynamic silhouettes and performance-driven graphic studies',
    },
    description: {
      ar: 'قسم مخصص لعرض التصاميم الفنية المستوحاة من السيارات الرياضية المعاصرة، حيث تلتقي الانسيابية الهوائية بالدقة البصرية في لوحات جدارية تعكس روح القيادة الديناميكية.',
      en: 'A dedicated collection template for contemporary sports car graphic art, capturing aerodynamic precision and dynamic proportion for modern interiors.',
    },
    curationNote: {
      ar: 'نموذج قسم — سيتم إدراج الإصدارات الفعلية عند الإطلاق الرسمي',
      en: 'Collection Placeholder — Official releases to be populated upon catalog launch',
    },
    image: BRAND_ASSETS.sportsCars,
    isPlaceholder: true,
  },
  {
    id: 'col-luxury',
    slug: 'luxury-icons',
    title: {
      ar: 'أيقونات الفخامة',
      en: 'Luxury Icons',
    },
    subtitle: {
      ar: 'حضور كلاسيكي يعكس الرقي والأناقة الخالدة',
      en: 'Timeless grand tourers and sculptural automotive heritage',
    },
    description: {
      ar: 'قسم يستعرض اللوحات الجرافيكية التي تحتفي بأيقونات الفخامة في عالم السيارات، بتناغم بصري يلائم المجالس الراقية والمكاتب التنفيذية في مصر.',
      en: 'A curated collection placeholder celebrating iconic luxury automobiles through refined graphic compositions suited for executive spaces and collector lounges.',
    },
    curationNote: {
      ar: 'نموذج قسم — سيتم إدراج الإصدارات الفعلية عند الإطلاق الرسمي',
      en: 'Collection Placeholder — Official releases to be populated upon catalog launch',
    },
    image: BRAND_ASSETS.luxuryIcons,
    isPlaceholder: true,
  },
  {
    id: 'col-legends',
    slug: 'speed-legends',
    title: {
      ar: 'أساطير السرعة',
      en: 'Speed Legends',
    },
    subtitle: {
      ar: 'توثيق بصري لرموز الحلبات والتاريخ الهندسي',
      en: 'Visual studies inspired by historic circuits and endurance icons',
    },
    description: {
      ar: 'قسم مخصص لتصاميم مستلهمة من تاريخ سباقات التحمل وأساطير السرعة، يبرز التفاصيل الهندسية والخطوط الجريئة لعشاق التميز والتفرد.',
      en: 'A collection placeholder highlighting technical graphic art inspired by legendary circuit machines and motorsport heritage.',
    },
    curationNote: {
      ar: 'نموذج قسم — سيتم إدراج الإصدارات الفعلية عند الإطلاق الرسمي',
      en: 'Collection Placeholder — Official releases to be populated upon catalog launch',
    },
    image: BRAND_ASSETS.speedLegends,
    isPlaceholder: true,
  },
];

export function formatCurrency(amount: number, lang: Language): string {
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  return lang === 'ar' ? `${formatted} ج.م` : `${formatted} EGP`;
}
