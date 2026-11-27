import type { Lang } from './translations';

/**
 * Legal notice + terms + privacy policy, one file, three languages.
 * Algerian law governs the studio; visitor rights are framed so they remain
 * meaningful internationally. No registration details are invented.
 */
export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalPage {
  title: string;
  updated: string;
  back: string;
  linkLegal: string;
  linkPrivacy: string;
  sections: LegalSection[];
}

const EN_LEGAL: LegalPage = {
  title: 'Legal notice & terms',
  updated: 'Last updated: November 2026',
  back: 'Back to the site',
  linkLegal: 'Legal notice & terms',
  linkPrivacy: 'Privacy',
  sections: [
    {
      heading: 'Publisher',
      body: [
        'VALKHYN Studio is an independent creative studio operated by Bendali Issam Eddine.',
        'Publication director: Bendali Issam Eddine. Contact is available through the brief form on this site.',
      ],
    },
    {
      heading: 'Terms of use',
      body: [
        'Browsing this site does not create a contract. Scope, deliverables, schedules and fees are agreed in writing before any work begins.',
        'Site content is provided for information only. You may not reproduce, reuse or exploit it without prior written permission, and you may not use the site for unlawful purposes or interfere with its operation.',
      ],
    },
    {
      heading: 'Intellectual property',
      body: [
        'All content on this site (texts, images, films, motion, voice recordings, code and visual identity) is the property of VALKHYN Studio unless stated otherwise.',
        'Any reproduction, representation or adaptation, in whole or in part, requires prior written consent. Client work shown here remains the property of its respective rights holders.',
      ],
    },
    {
      heading: 'Liability',
      body: [
        'This site is provided as is. We take care to keep the information accurate, but give no guarantee that it is complete or free of errors.',
        'External links, if any, are provided for convenience only; VALKHYN Studio does not control their content.',
      ],
    },
    {
      heading: 'Applicable law and jurisdiction',
      body: [
        'This site and its use are governed by Algerian law, in particular Law No. 18-03 of 12 May 2018 on the protection of personal data and Law No. 04-21 of 6 December 2004 on electronic documents and electronic signature.',
        'Any dispute is subject to the competent courts of Algiers. Mandatory consumer or data-protection rights you hold under the law of your country remain unaffected.',
      ],
    },
  ],
};

const EN_PRIVACY: LegalPage = {
  ...EN_LEGAL,
  title: 'Privacy policy',
  sections: [
    {
      heading: 'Data controller',
      body: ['VALKHYN Studio, operated by Bendali Issam Eddine.'],
    },
    {
      heading: 'What is collected',
      body: [
        'The brief form opens your own mail application. The name, email address, discipline and message you enter are composed into an email to the studio; nothing is stored on this site.',
        'Your browser keeps two functional preferences locally: your language ("valkhyn-lang") and your theme ("valkhyn-theme") in localStorage.',
      ],
    },
    {
      heading: 'Why, and on what basis',
      body: [
        'Your message is used only to answer your inquiry and, if a project follows, to manage the working relationship. The basis is pre-contractual steps taken at your request and our legitimate interest in replying, as recognised by Algerian Law No. 18-03 of 12 May 2018 and, for visitors in the EEA or UK, by the equivalent GDPR grounds (art. 6.1.b and 6.1.f).',
        'Language and theme preferences are strictly functional and need no consent beyond your own choice.',
      ],
    },
    {
      heading: 'How long',
      body: [
        'Inquiries that do not lead to a project are deleted after 24 months. Project correspondence is kept for the duration of the relationship plus the applicable legal retention period.',
      ],
    },
    {
      heading: 'Cookies and trackers',
      body: [
        'No analytics, no advertising, no social pixels and no cookie banner: this site sets no cookies.',
        'Web fonts are loaded from Google Fonts (fonts.googleapis.com), which receives your IP address when a page loads.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'You may request access to, correction of or deletion of the data contained in the email you send, and object to its processing where applicable. Use the brief form to reach the studio.',
        'You may also complain to the Algerian data-protection authority (CNDP, cndp.dz) or to the supervisory authority where you live.',
      ],
    },
  ],
};

const FR_LEGAL: LegalPage = {
  title: 'Mentions légales et conditions',
  updated: 'Dernière mise à jour : novembre 2026',
  back: 'Retour au site',
  linkLegal: 'Mentions légales et conditions',
  linkPrivacy: 'Confidentialité',
  sections: [
    {
      heading: 'Éditeur',
      body: [
        'VALKHYN Studio est un studio créatif indépendant exploité par Bendali Issam Eddine.',
        'Directeur de la publication : Bendali Issam Eddine. Le contact se fait via le formulaire de brief présent sur ce site.',
      ],
    },
    {
      heading: 'Conditions d’utilisation',
      body: [
        'La navigation sur ce site ne crée pas de contrat. Le périmètre, les livrables, les délais et les tarifs sont convenus par écrit avant le début de toute prestation.',
        'Les contenus du site sont fournis à titre informatif. Toute reproduction, réutilisation ou exploitation sans autorisation écrite préalable est interdite ; vous vous engagez à ne pas utiliser le site à des fins illicites ni à en perturber le fonctionnement.',
      ],
    },
    {
      heading: 'Propriété intellectuelle',
      body: [
        'L’ensemble des contenus de ce site (textes, images, films, motion, voix, code et identité visuelle) appartient à VALKHYN Studio, sauf mention contraire.',
        'Toute reproduction, représentation ou adaptation, totale ou partielle, nécessite une autorisation écrite préalable. Les travaux clients publiés ici restent la propriété de leurs titulaires de droits.',
      ],
    },
    {
      heading: 'Responsabilité',
      body: [
        'Ce site est fourni en l’état. Nous veillons à l’exactitude des informations, sans garantie qu’elles soient complètes ou exemptes d’erreurs.',
        'Les liens externes, s’il y en a, sont proposés à titre indicatif ; VALKHYN Studio n’en contrôle pas le contenu.',
      ],
    },
    {
      heading: 'Droit applicable et juridiction',
      body: [
        'Ce site et son utilisation sont soumis au droit algérien, notamment à la loi n° 18-03 du 12 mai 2018 relative à la protection des données personnelles et à la loi n° 04-21 du 6 décembre 2004 relative aux documents et à la signature électroniques.',
        'Tout litige relève des juridictions compétentes d’Alger. Les droits impératifs dont vous disposez selon la loi de votre pays, en matière de consommation ou de protection des données, demeurent inchangés.',
      ],
    },
  ],
};

const FR_PRIVACY: LegalPage = {
  ...FR_LEGAL,
  title: 'Politique de confidentialité',
  sections: [
    {
      heading: 'Responsable du traitement',
      body: ['VALKHYN Studio, exploité par Bendali Issam Eddine.'],
    },
    {
      heading: 'Données collectées',
      body: [
        'Le formulaire de brief ouvre votre application mail. Le nom, l’adresse email, la discipline et le message saisis sont composés dans un courriel adressé au studio ; rien n’est stocké sur ce site.',
        'Votre navigateur conserve deux préférences fonctionnelles : la langue (« valkhyn-lang ») et le thème (« valkhyn-theme ») dans le localStorage.',
      ],
    },
    {
      heading: 'Pourquoi, et sur quelle base',
      body: [
        'Votre message sert uniquement à répondre à votre demande et, si un projet suit, à conduire la relation de travail. La base est les mesures précontractuelles prises à votre demande et notre intérêt légitime à répondre, reconnus par la loi algérienne n° 18-03 du 12 mai 2018 et, pour les visiteurs de l’EEE ou du Royaume-Uni, par les fondements équivalents du RGPD (art. 6.1.b et 6.1.f).',
        'Les choix de langue et de thème sont purement fonctionnels et ne requièrent aucun consentement au-delà de votre choix.',
      ],
    },
    {
      heading: 'Combien de temps',
      body: [
        'Les demandes sans suite sont supprimées après 24 mois. La correspondance liée à un projet est conservée pendant la durée de la relation augmentée du délai légal de conservation applicable.',
      ],
    },
    {
      heading: 'Cookies et traceurs',
      body: [
        'Aucune mesure d’audience, aucune publicité, aucun pixel social, aucune bannière cookies : ce site ne dépose aucun cookie.',
        'Les polices sont chargées depuis Google Fonts (fonts.googleapis.com), qui reçoit votre adresse IP au chargement de la page.',
      ],
    },
    {
      heading: 'Vos droits',
      body: [
        'Vous pouvez demander l’accès, la rectification ou la suppression des données contenues dans le courriel envoyé, et vous opposer à leur traitement le cas échéant. Utilisez le formulaire de brief pour contacter le studio.',
        'Vous pouvez également saisir l’autorité algérienne de protection des données (CNDP, cndp.dz) ou l’autorité de contrôle de votre pays de résidence.',
      ],
    },
  ],
};

const AR_LEGAL: LegalPage = {
  title: 'الإشعار القانوني والشروط',
  updated: 'آخر تحديث: نوفمبر 2026',
  back: 'العودة إلى الموقع',
  linkLegal: 'الإشعار القانوني والشروط',
  linkPrivacy: 'الخصوصية',
  sections: [
    {
      heading: 'الناشر',
      body: [
        'فالكاين استوديو (VALKHYN Studio) استوديو إبداعي مستقل يديره بن دالي عصام الدين.',
        'مدير النشر: بن دالي عصام الدين. يمكن التواصل مع الاستوديو عبر نموذج الموجز المتاح في هذا الموقع.',
      ],
    },
    {
      heading: 'شروط الاستخدام',
      body: [
        'تصفح هذا الموقع لا ينشئ عقداً. يُتفق على النطاق والمخرجات والمدد والأسعار كتابةً قبل بدء أي عمل.',
        'محتويات الموقع مقدمة لأغراض المعلومة فقط. لا يجوز نسخها أو إعادة استخدامها أو استغلالها دون إذن كتابي مسبق، كما لا يجوز استخدام الموقع لأغراض غير قانونية أو لإعاقة عمله.',
      ],
    },
    {
      heading: 'الملكية الفكرية',
      body: [
        'كل محتويات هذا الموقع (النصوص والصور والأفلام والموشن والتسجيلات الصوتية والشيفرة والهوية البصرية) ملك لفالكاين استوديو ما لم يُذكر خلاف ذلك.',
        'يُمنع أي استنساخ أو تمثيل أو تعديل، كلياً أو جزئياً، دون موافقة كتابية مسبقة. أعمال العملاء المعروضة هنا تبقى ملكاً لأصحاب حقوقها.',
      ],
    },
    {
      heading: 'المسؤولية',
      body: [
        'يُقدَّم هذا الموقع كما هو. نحرص على دقة المعلومات دون أن نضمن أنها كاملة أو خالية من الأخطاء.',
        'الروابط الخارجية، إن وُجدت، للاستدلال فقط ولا يتحكم فالكاين استوديو في محتواها.',
      ],
    },
    {
      heading: 'القانون المطبق والاختصاص القضائي',
      body: [
        'يخضع هذا الموقع واستخدامه للقانون الجزائري، لا سيما القانون رقم 18-03 المؤرخ في 12 مايو 2018 المتعلق بحماية البيانات الشخصية والقانون رقم 04-21 المؤرخ في 6 ديسمبر 2004 المتعلق بالوثائق الإلكترونية والتوقيع الإلكتروني.',
        'أي نزاع يخضع للمحاكم الجزائرية المختصة في الجزائر العاصمة. ولا تُخل هذه الشروط بالحقوق الإلزامية التي تتمتع بها بموجب قانون بلدك في مجال حماية المستهلك أو البيانات.',
      ],
    },
  ],
};

const AR_PRIVACY: LegalPage = {
  ...AR_LEGAL,
  title: 'سياسة الخصوصية',
  sections: [
    {
      heading: 'المسؤول عن المعالجة',
      body: ['فالكاين استوديو (VALKHYN Studio)، يديره بن دالي عصام الدين.'],
    },
    {
      heading: 'ما يُجمَع',
      body: [
        'يفتح نموذج الموجز تطبيق البريد لديك. يُكوَّن الاسم والبريد الإلكتروني والتخصص والرسالة التي تُدخلها في رسالة موجهة إلى الاستوديو؛ لا يُخزَّن أي شيء على هذا الموقع.',
        'يحتفظ متصفحك محلياً بتفضيلين وظيفيين: اللغة («valkhyn-lang») والوضع («valkhyn-theme») في localStorage.',
      ],
    },
    {
      heading: 'لماذا، وعلى أي أساس',
      body: [
        'تُستخدم رسالتك فقط للرد على طلبك، وإذا تبع ذلك مشروع، لإدارة علاقة العمل. يستند ذلك إلى الخطوات التمهيدية للتعاقد بناءً على طلبك وإلى المصلحة المشروعة للاستوديو في الرد، وفقاً للقانون الجزائري رقم 18-03 المؤرخ في 12 مايو 2018، وبالنسبة لزوار المنطقة الاقتصادية الأوروبية والمملكة المتحدة، وفقاً للأسس المكافئة في اللائحة العامة لحماية البيانات (المادتان 6.1.b و6.1.f).',
        'اختيار اللغة والوضع وظيفي بحت ولا يحتاج موافقة تتجاوز اختيارك.',
      ],
    },
    {
      heading: 'مدة الحفظ',
      body: [
        'تُحذف الطلبات التي لا تؤدي إلى مشروع بعد 24 شهراً. تُحفظ المراسلة المرتبطة بمشروع طوال مدة العلاقة مضافاً إليها مدة الحفظ القانونية.',
      ],
    },
    {
      heading: 'الكوكيز وأدوات التتبع',
      body: [
        'لا إحصاءات ولا إعلانات ولا بكسلات اجتماعية ولا لافتة كوكيز، لأن الموقع لا يضع أي كوكي.',
        'تُحمَّل الخطوط من Google Fonts (fonts.googleapis.com) التي تتلقى عنوان IP الخاص بك عند تحميل الصفحة.',
      ],
    },
    {
      heading: 'حقوقك',
      body: [
        'يمكنك طلب الاطلاع على البيانات الواردة في الرسالة المرسلة أو تصحيحها أو حذفها، والاعتراض على معالجتها عند الاقتضاء. استخدم نموذج الموجز للتواصل مع الاستوديو.',
        'يمكنك أيضاً تقديم شكوى إلى سلطة حماية البيانات الجزائرية (CNDP، cndp.dz) أو إلى السلطة الرقابية في بلد إقامتك.',
      ],
    },
  ],
};

export const LEGAL_PAGES: Record<Lang, { legal: LegalPage; privacy: LegalPage }> = {
  en: { legal: EN_LEGAL, privacy: EN_PRIVACY },
  fr: { legal: FR_LEGAL, privacy: FR_PRIVACY },
  ar: { legal: AR_LEGAL, privacy: AR_PRIVACY },
};
