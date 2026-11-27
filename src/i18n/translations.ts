export type Lang = 'en' | 'fr' | 'ar';
export type Dict = Record<string, string>;

/**
 * Every string the site renders. `en` is the source of truth, the other two
 * are real translations, not placeholders. Keys never change shape between
 * languages, so the UI cannot half-translate.
 */
export const UI: Record<Lang, Dict> = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.work': 'Work',
    'nav.process': 'Process',
    'nav.contact': 'Contact',
    'nav.available': 'Available',
    'nav.cta': "Let's talk",
    'nav.menu': 'Toggle menu',
    'nav.language': 'Language',
    'theme.toLight': 'Switch to light theme',
    'theme.toDark': 'Switch to dark theme',
    'about.portraitAlt': 'Portrait of Bendali Issam Eddine',
    'about.operatorLabel': 'Operator of the studio —',
    'about.operatorName': 'Bendali Issam Eddine',
    'services.frame.video': 'Professional editing desk with a keyboard and a scope monitor',
    'services.frame.motion': 'Designer using a stylus on a graphics tablet in the studio',
    'services.frame.voice': 'Condenser microphone on a boom in a treated recording booth',
    'services.frame.delivery': 'Silver storage enclosure and drives ready for final delivery',

    'hero.title': 'Welcome to VALKHYN Studio',
    'hero.blurb':
      'From editing and motion design to voice-over, we shape every frame, cut and sound as one studio, from first brief to final master.',
    'hero.ctaWork': 'Explore the work',
    'hero.ctaContact': 'Start a project',

    'about.lead': 'We blend creativity with technology to build visual',
    'about.accent': 'experiences',
    'about.tail': 'that connect.',
    'about.body':
      'At VALKHYN Studio, every frame, every motion, every sound is designed to tell a story and evoke emotion. We keep editing, motion and voice under one roof, so narrative intent survives from brief to master.',

    'services.lead': 'Three disciplines.',
    'services.accent': 'One studio.',

    'disc.video.title': 'Video Editing',
    'disc.video.subtitle': 'Rhythm & Cut',
    'disc.video.desc':
      'Frame-accurate cutting, narrative pacing and colour finishing. We turn raw footage into a clear, coherent story built for its final platform.',
    'disc.motion.title': 'Motion Design',
    'disc.motion.subtitle': 'Motion & Visual',
    'disc.motion.desc':
      'Motion graphics, title systems, logo animation and clean compositing. We use movement to explain the idea and keep the brand consistent across every format.',
    'disc.voice.title': 'Voice-Over',
    'disc.voice.subtitle': 'Vocal & Sound',
    'disc.voice.desc':
      'Studio narration in English, French and Arabic. We direct and shape the performance so it sits naturally in the final mix.',

    'work.title': 'The work',
    'work.empty.title': 'First case studies landing',
    'work.empty.body':
      'The studio is taking on a small number of commissions. Real client work will be published here as it ships. Nothing invented, nothing borrowed.',
    'work.empty.cta': 'Start a project',

    'process.lead': 'Our process.',
    'process.accent': 'Five moves.',
    'process.1.title': 'Direct Briefing',
    'process.1.desc':
      'You speak directly with the editor, motion designer and voice artist. Tone, pace and sound are set in one session. Zero middlemen.',
    'process.2.title': 'Rhythm & Cut',
    'process.2.desc':
      'Footage trimmed to frame-perfect cuts. Beat matching and narrative pacing locked into a strong rough cut.',
    'process.3.title': 'Motion & Visual',
    'process.3.desc':
      'Kinetic titles, custom VFX and 3D elements integrated into the timeline with a single colour grade.',
    'process.4.title': 'Vocal & Sound',
    'process.4.desc':
      'Voice-over recorded in-house on the studio chain, paired with sound design and a master mix.',
    'process.5.title': 'Final Delivery',
    'process.5.desc':
      'Mastered for broadcast, cinema, web and social. Multi-aspect cutdowns included in one asset pack.',

    'contact.lead': "Let's work",
    'contact.accent': 'together.',
    'contact.body':
      'Have a project in mind? Tell us what you are building and we will shape the tone, pace and sound in one direct session. No middlemen, no handoffs.',
    'form.name': 'Your name',
    'form.namePh': 'Name',
    'form.email': 'Email',
    'form.emailPh': 'you@studio.com',
    'form.discipline': 'Discipline',
    'form.message': 'The project',
    'form.messagePh': 'Tell us about it',
    'form.submit': 'Send brief',
    'form.sentTitle': 'Brief ready',
    'form.sentBody': 'Your mail app should be open with the brief ready to send.',
    'form.disc.video': 'Video Editing',
    'form.disc.motion': 'Motion Design',
    'form.disc.voice': 'Voice-Over',
    'form.disc.full': 'Full production',

    'footer.top': 'Top',
    'footer.motto': 'Three disciplines. One studio.',

    'splash.title': 'VALKHYN',
    'splash.skip': 'Click to skip',
  },

  fr: {
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.services': 'Services',
    'nav.work': 'Projets',
    'nav.process': 'Méthode',
    'nav.contact': 'Contact',
    'nav.available': 'Disponible',
    'nav.cta': 'Parlons-en',
    'nav.menu': 'Ouvrir le menu',
    'nav.language': 'Langue',
    'theme.toLight': 'Passer au thème clair',
    'theme.toDark': 'Passer au thème sombre',
    'about.portraitAlt': 'Portrait de Bendali Issam Eddine',
    'about.operatorLabel': 'Opérateur du studio —',
    'about.operatorName': 'Bendali Issam Eddine',
    'services.frame.video': 'Bureau de montage professionnel avec clavier et moniteur de contrôle',
    'services.frame.motion': 'Designer utilisant un stylet sur une tablette graphique en studio',
    'services.frame.voice': 'Micro à condensateur sur bras dans une cabine de prise insonorisée',
    'services.frame.delivery': 'Boîtier de stockage argenté et disques prêts pour la livraison finale',

    'hero.title': 'Bienvenue chez VALKHYN Studio',
    'hero.blurb':
      'Du montage au motion design en passant par la voix-off, nous façonnons chaque image, chaque coupe et chaque son comme un seul studio, du premier brief au master final.',
    'hero.ctaWork': 'Voir les projets',
    'hero.ctaContact': 'Démarrer un projet',

    'about.lead': 'Nous fusionnons création et technologie pour bâtir des',
    'about.accent': 'expériences',
    'about.tail': 'visuelles qui connectent.',
    'about.body':
      'Chez VALKHYN Studio, chaque image, chaque mouvement, chaque son est pensé pour raconter une histoire et provoquer une émotion. Nous réunissons le montage, le motion et la voix sous un même toit, pour que l’intention narrative survive du brief au master.',

    'services.lead': 'Trois disciplines.',
    'services.accent': 'Un studio.',

    'disc.video.title': 'Montage Vidéo',
    'disc.video.subtitle': 'Rythme & Coupe',
    'disc.video.desc':
      'Montage au frame près, rythme narratif et étalonnage. Nous transformons des rushes en une histoire claire et cohérente, adaptée à son support de diffusion.',
    'disc.motion.title': 'Motion Design',
    'disc.motion.subtitle': 'Mouvement & Image',
    'disc.motion.desc':
      'Motion design, habillages, animation de logo et compositing propre. Le mouvement sert l’idée et garde la marque cohérente sur tous les formats.',
    'disc.voice.title': 'Voix-Off',
    'disc.voice.subtitle': 'Voix & Son',
    'disc.voice.desc':
      'Narration en studio en anglais, français et arabe. Nous dirigeons et façonnons la performance pour qu’elle s’intègre naturellement au mix final.',

    'work.title': 'Les projets',
    'work.empty.title': 'Premières études de cas à venir',
    'work.empty.body':
      "Le studio accepte un nombre limité de projets. Les vrais travaux clients seront publiés ici dès leur livraison. Rien d'inventé, rien d'emprunté.",
    'work.empty.cta': 'Démarrer un projet',

    'process.lead': 'Notre méthode.',
    'process.accent': 'Cinq temps.',
    'process.1.title': 'Brief Direct',
    'process.1.desc':
      "Vous parlez directement au monteur, au motion designer et à la voix. Le ton, le rythme et le son se fixent en une session. Zéro intermédiaire.",
    'process.2.title': 'Rythme & Coupe',
    'process.2.desc':
      'Des images taillées au frame près. Calage sur la musique et rythme narratif verrouillés dans un rough cut solide.',
    'process.3.title': 'Mouvement & Image',
    'process.3.desc':
      'Titres cinétiques, VFX sur mesure et éléments 3D intégrés à la timeline avec un étalonnage unique.',
    'process.4.title': 'Voix & Son',
    'process.4.desc':
      'Voix-off enregistrée en interne sur la chaîne studio, accompagnée de sound design et d’un mix master.',
    'process.5.title': 'Livraison Finale',
    'process.5.desc':
      'Masterisé pour le broadcast, le cinéma, le web et les réseaux. Déclinaisons multi-formats incluses dans un seul pack.',

    'contact.lead': 'Travaillons',
    'contact.accent': 'ensemble.',
    'contact.body':
      'Un projet en tête ? Dites-nous ce que vous construisez et nous fixerons le ton, le rythme et le son en une session directe. Sans intermédiaire, sans décalage.',
    'form.name': 'Votre nom',
    'form.namePh': 'Nom',
    'form.email': 'E-mail',
    'form.emailPh': 'vous@studio.com',
    'form.discipline': 'Discipline',
    'form.message': 'Le projet',
    'form.messagePh': 'Parlez-nous du projet',
    'form.submit': 'Envoyer le brief',
    'form.sentTitle': 'Brief prêt',
    'form.sentBody': "Votre application mail devrait être ouverte avec le brief prêt à envoyer.",
    'form.disc.video': 'Montage Vidéo',
    'form.disc.motion': 'Motion Design',
    'form.disc.voice': 'Voix-Off',
    'form.disc.full': 'Production complète',

    'footer.top': 'Haut',
    'footer.motto': 'Trois disciplines. Un studio.',

    'splash.title': 'VALKHYN',
    'splash.skip': 'Cliquer pour passer',
  },

  ar: {
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.services': 'الخدمات',
    'nav.work': 'الأعمال',
    'nav.process': 'المنهجية',
    'nav.contact': 'التواصل',
    'nav.available': 'متاح',
    'nav.cta': 'لنتحدث',
    'nav.menu': 'القائمة',
    'nav.language': 'اللغة',
    'theme.toLight': 'التبديل إلى الوضع الفاتح',
    'theme.toDark': 'التبديل إلى الوضع الداكن',
    'about.portraitAlt': 'صورة بن دالي عصام الدين',
    'about.operatorLabel': 'مشغل الاستوديو —',
    'about.operatorName': 'بن دالي عصام الدين',
    'services.frame.video': 'مكتب مونتاج احترافي فيه لوحة مفاتيح وشاشة مراقبة',
    'services.frame.motion': 'مصمم يستخدم قلماً على لوحة رسومية داخل الاستوديو',
    'services.frame.voice': 'ميكروفون مكثف على ذراع داخل كابينة تسجيل معالجة صوتياً',
    'services.frame.delivery': 'علبة تخزين فضية وأقراص جاهزة للتسليم النهائي',

    'hero.title': 'مرحباً بكم في فالكاين استوديو',
    'hero.blurb':
      'من المونتاج وتصميم الموشن إلى التعليق الصوتي، نصوغ كل إطار وكل قطعة وكل صوت كاستوديو واحد، من أول موجز إلى النسخة النهائية.',
    'hero.ctaWork': 'استكشف الأعمال',
    'hero.ctaContact': 'ابدأ مشروعاً',

    'about.lead': 'ندمج الإبداع بالتقنية لبناء',
    'about.accent': 'تجارب',
    'about.tail': 'بصرية تصنع اتصالاً.',
    'about.body':
      'في فالكاين استوديو، كل إطار وكل حركة وكل صوت مصمم ليحكي قصة ويصنع إحساساً. نجمع المونتاج والموشن والصوت تحت سقف واحد، لتبقى نية الحكاية من الموجز حتى النسخة النهائية.',

    'services.lead': 'ثلاثة تخصصات.',
    'services.accent': 'استوديو واحد.',

    'disc.video.title': 'مونتاج الفيديو',
    'disc.video.subtitle': 'إيقاع وقطع',
    'disc.video.desc':
      'قصّ دقيق بإيقاع سردي وتصحيح ألوان. نحوّل المواد الخام إلى قصة واضحة ومتماسكة تناسب منصة عرضها النهائية.',
    'disc.motion.title': 'تصميم الموشن',
    'disc.motion.subtitle': 'حركة وصورة',
    'disc.motion.desc':
      'موشن جرافيك، أنظمة عناوين، تحريك شعارات وتركيب نظيف. نستخدم الحركة لشرح الفكرة والحفاظ على هوية العلامة عبر كل المقاسات.',
    'disc.voice.title': 'التعليق الصوتي',
    'disc.voice.subtitle': 'صوت وأداء',
    'disc.voice.desc':
      'تسجيل تعليق في الاستوديو بالإنجليزية والفرنسية والعربية. نوجّه الأداء ونضبطه ليندمج بسلاسة في المزج النهائي.',

    'work.title': 'الأعمال',
    'work.empty.title': 'أول دراسات الحالة قادمة',
    'work.empty.body':
      'الاستوديو يستقبل عدداً محدوداً من المشاريع. الأعمال الحقيقية للعملاء ستُنشر هنا فور تسليمها. لا شيء مُختلق ولا شيء مُستعار.',
    'work.empty.cta': 'ابدأ مشروعاً',

    'process.lead': 'منهجيتنا.',
    'process.accent': 'خمس خطوات.',
    'process.1.title': 'موجز مباشر',
    'process.1.desc':
      'تتحدث مباشرة مع المونتير ومصمم الموشن وصاحب الصوت. النبرة والإيقاع والصوت تُحدد في جلسة واحدة. بلا وسطاء.',
    'process.2.title': 'إيقاع وقطع',
    'process.2.desc':
      'لقطات مقصوصة على الإطار بدقة. مطابقة الإيقاع الموسيقي والسرد مُثبّتة في نسخة أولى صلبة.',
    'process.3.title': 'حركة وصورة',
    'process.3.desc':
      'عناوين حركية ومؤثرات مخصصة وعناصر ثلاثية الأبعاد مدموجة في التايم لاين بتلوين واحد موحّد.',
    'process.4.title': 'صوت وأداء',
    'process.4.desc':
      'تعليق صوتي يُسجّل داخلياً على سلسلة الاستوديو، مع تصميم صوتي وميكس نهائي.',
    'process.5.title': 'التسليم النهائي',
    'process.5.desc':
      'ماسترد للبث والسينما والويب والسوشال. نسخ متعددة المقاسات في حزمة واحدة.',

    'contact.lead': 'لنعمل',
    'contact.accent': 'معاً.',
    'contact.body':
      'لديك مشروع في بالك؟ أخبرنا بما تبنيه وسنضبط النبرة والإيقاع والصوت في جلسة مباشرة. بلا وسطاء وبلا تسليمات متقطعة.',
    'form.name': 'اسمك',
    'form.namePh': 'الاسم',
    'form.email': 'البريد',
    'form.emailPh': 'you@studio.com',
    'form.discipline': 'التخصص',
    'form.message': 'المشروع',
    'form.messagePh': 'أخبرنا عنه',
    'form.submit': 'أرسل الموجز',
    'form.sentTitle': 'الموجز جاهز',
    'form.sentBody': 'سيُفتح تطبيق البريد لديك والموجز جاهز للإرسال.',
    'form.disc.video': 'مونتاج الفيديو',
    'form.disc.motion': 'تصميم الموشن',
    'form.disc.voice': 'التعليق الصوتي',
    'form.disc.full': 'إنتاج كامل',

    'footer.top': 'الأعلى',
    'footer.motto': 'ثلاثة تخصصات. استوديو واحد.',

    'splash.title': 'VALKHYN',
    'splash.skip': 'انقر للتخطي',
  },
};
