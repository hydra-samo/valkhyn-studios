import type { Lang } from './translations';

/**
 * Legal notice + privacy policy, one file, three languages. Fields marked
 * [TODO: ...] are the only blanks: they need the studio's real registration
 * data, which the code cannot invent.
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
  title: 'Legal notice',
  updated: 'Last updated: November 2026',
  back: 'Back to the site',
  linkLegal: 'Legal notice',
  linkPrivacy: 'Privacy',
  sections: [
    {
      heading: 'Publisher',
      body: [
        'HYDRA SAMO LABS, independent creative studio operated by Bendali Issam Eddine.',
        '[TODO: registered name and legal form] · [TODO: registered address] · [TODO: SIRET / VAT number]',
        'Publication director: Bendali Issam Eddine. Contact: hello@hydrasamo.com',
      ],
    },
    {
      heading: 'Hosting',
      body: [
        'This site is hosted by GitHub Pages, GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States.',
        '[TODO: add the host of the domain name, if it differs from the host above]',
      ],
    },
    {
      heading: 'Intellectual property',
      body: [
        'All content on this site (texts, images, films, motion design, voice recordings, code and visual identity) is the property of HYDRA SAMO LABS unless stated otherwise.',
        'Any reproduction, representation or adaptation, in whole or in part, is forbidden without prior written consent. Client work published here remains the property of its respective rights holders.',
      ],
    },
    {
      heading: 'Liability',
      body: [
        'This site is provided as is. External links are provided for convenience only; HYDRA SAMO LABS has no control over their content.',
      ],
    },
    {
      heading: 'Applicable law',
      body: [
        'This site is governed by French law. [TODO: competent court] has jurisdiction over any dispute.',
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
      body: ['HYDRA SAMO LABS, operated by Bendali Issam Eddine. Contact: hello@hydrasamo.com'],
    },
    {
      heading: 'What is collected',
      body: [
        'Only what you choose to send: the contact form opens your own mail application, so the name, email address, discipline and message you enter are sent to the studio by email. Nothing is stored on this site, and there is no database behind the form.',
        'The only data kept in your browser is your language choice, stored in localStorage under "hydra-lang".',
      ],
    },
    {
      heading: 'Why, and on what basis',
      body: [
        'Your message is used to answer your inquiry and, if a project follows, to run the working relationship. The legal basis is pre-contractual steps taken at your request (GDPR art. 6.1.b) and the studio\u2019s legitimate interest in replying to prospects (art. 6.1.f).',
        'Keeping your language preference is strictly functional and needs no consent beyond your own choice.',
      ],
    },
    {
      heading: 'How long',
      body: [
        'Inquiries that do not lead to a project are deleted after 24 months. Project correspondence is kept for the duration of the relationship plus the legal retention period. [TODO: confirm retention periods with the accountant]',
      ],
    },
    {
      heading: 'Cookies and trackers',
      body: [
        'No analytics, no advertising, no social pixels, no cookie banner, because no cookie is set by this site.',
        'Web fonts are loaded from Google Fonts (fonts.googleapis.com), which receives your IP address when the page loads. [TODO: self-host the fonts to remove this third-party request]',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'You can ask to access, correct, delete or export your data, or object to its processing, by writing to hello@hydrasamo.com. You may also lodge a complaint with the CNIL (www.cnil.fr).',
      ],
    },
  ],
};

const FR_LEGAL: LegalPage = {
  title: 'Mentions légales',
  updated: 'Dernière mise à jour : novembre 2026',
  back: 'Retour au site',
  linkLegal: 'Mentions légales',
  linkPrivacy: 'Confidentialité',
  sections: [
    {
      heading: 'Éditeur',
      body: [
        'HYDRA SAMO LABS, studio créatif indépendant exploité par Bendali Issam Eddine.',
        '[TODO : raison sociale et forme juridique] · [TODO : adresse du siège] · [TODO : SIRET / TVA]',
        'Directeur de la publication : Bendali Issam Eddine. Contact : hello@hydrasamo.com',
      ],
    },
    {
      heading: 'Hébergement',
      body: [
        'Ce site est hébergé par GitHub Pages, GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.',
        '[TODO : ajouter l’hébergeur du nom de domaine s’il diffère]',
      ],
    },
    {
      heading: 'Propriété intellectuelle',
      body: [
        'L’ensemble des contenus de ce site (textes, images, films, motion design, voix, code et identité visuelle) appartient à HYDRA SAMO LABS, sauf mention contraire.',
        'Toute reproduction, représentation ou adaptation, totale ou partielle, est interdite sans autorisation écrite préalable. Les travaux clients publiés ici restent la propriété de leurs titulaires de droits.',
      ],
    },
    {
      heading: 'Responsabilité',
      body: [
        'Ce site est fourni en l’état. Les liens externes sont proposés à titre indicatif ; HYDRA SAMO LABS n’en contrôle pas le contenu.',
      ],
    },
    {
      heading: 'Droit applicable',
      body: [
        'Ce site est soumis au droit français. [TODO : tribunal compétent] est compétent pour tout litige.',
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
      body: ['HYDRA SAMO LABS, exploité par Bendali Issam Eddine. Contact : hello@hydrasamo.com'],
    },
    {
      heading: 'Données collectées',
      body: [
        'Uniquement ce que vous choisissez d’envoyer : le formulaire de contact ouvre votre propre application de messagerie, donc le nom, l’adresse email, la discipline et le message saisis partent par email vers le studio. Rien n’est stocké sur ce site et aucune base de données ne se cache derrière le formulaire.',
        'La seule donnée conservée dans votre navigateur est votre choix de langue, dans le localStorage sous la clé « hydra-lang ».',
      ],
    },
    {
      heading: 'Pourquoi, et sur quelle base',
      body: [
        'Votre message sert à répondre à votre demande et, si un projet suit, à conduire la relation de travail. La base légale est l’exécution de mesures précontractuelles prises à votre demande (RGPD art. 6.1.b) et l’intérêt légitime du studio à répondre aux prospects (art. 6.1.f).',
        'La mémorisation de la langue est purement fonctionnelle et ne requiert aucun consentement au-delà de votre choix.',
      ],
    },
    {
      heading: 'Combien de temps',
      body: [
        'Les demandes qui n’aboutissent pas à un projet sont supprimées au bout de 24 mois. La correspondance de projet est conservée pendant la relation puis pendant la durée légale de conservation. [TODO : confirmer les durées avec le comptable]',
      ],
    },
    {
      heading: 'Cookies et traceurs',
      body: [
        'Aucune mesure d’audience, aucune publicité, aucun pixel social, aucune bannière cookies : ce site ne dépose aucun cookie.',
        'Les polices sont chargées depuis Google Fonts (fonts.googleapis.com), qui reçoit votre adresse IP au chargement de la page. [TODO : héberger les polices localement pour supprimer cet appel tiers]',
      ],
    },
    {
      heading: 'Vos droits',
      body: [
        'Vous pouvez demander l’accès, la rectification, l’effacement ou la portabilité de vos données, ou vous opposer à leur traitement, en écrivant à hello@hydrasamo.com. Vous pouvez également saisir la CNIL (www.cnil.fr).',
      ],
    },
  ],
};

const AR_LEGAL: LegalPage = {
  title: 'الإشعار القانوني',
  updated: 'آخر تحديث: نوفمبر 2026',
  back: 'العودة إلى الموقع',
  linkLegal: 'الإشعار القانوني',
  linkPrivacy: 'الخصوصية',
  sections: [
    {
      heading: 'الناشر',
      body: [
        'HYDRA SAMO LABS، استوديو إبداعي مستقل يديره بن دالي عصام الدين.',
        '[TODO: الاسم القانوني والشكل القانوني] · [TODO: عنوان المقر] · [TODO: رقم السجل التجاري / الرقم الضريبي]',
        'مدير النشر: بن دالي عصام الدين. التواصل: hello@hydrasamo.com',
      ],
    },
    {
      heading: 'الاستضافة',
      body: [
        'يُستضاف هذا الموقع لدى GitHub Pages، GitHub Inc.، 88 Colin P. Kelly Jr. Street، سان فرانسيسكو، CA 94107، الولايات المتحدة.',
        '[TODO: أضف مستضيف اسم النطاق إن كان مختلفاً]',
      ],
    },
    {
      heading: 'الملكية الفكرية',
      body: [
        'كل محتويات هذا الموقع (النصوص والصور والأفلام والموشن والصوت والشيفرة والهوية البصرية) ملك لـ HYDRA SAMO LABS ما لم يُذكر خلاف ذلك.',
        'يُمنع أي استنساخ أو تمثيل أو تعديل، كلياً أو جزئياً، دون موافقة كتابية مسبقة. أعمال العملاء المنشورة هنا تبقى ملكاً لأصحاب حقوقها.',
      ],
    },
    {
      heading: 'المسؤولية',
      body: [
        'يُقدَّم هذا الموقع كما هو. الروابط الخارجية للاستدلال فقط ولا يتحكم الاستوديو في محتواها.',
      ],
    },
    {
      heading: 'القانون المطبق',
      body: ['يخضع هذا الموقع للقانون الفرنسي. [TODO: المحكمة المختصة] مختصة في أي نزاع.'],
    },
  ],
};

const AR_PRIVACY: LegalPage = {
  ...AR_LEGAL,
  title: 'سياسة الخصوصية',
  sections: [
    {
      heading: 'المسؤول عن المعالجة',
      body: ['HYDRA SAMO LABS، يديره بن دالي عصام الدين. التواصل: hello@hydrasamo.com'],
    },
    {
      heading: 'ما يُجمَع',
      body: [
        'فقط ما تختار إرساله: نموذج التواصل يفتح تطبيق البريد لديك، فما تكتبه من اسم وبريد وتخصص ورسالة يُرسَل إلى الاستوديو بالبريد. لا شيء يُخزَّن على هذا الموقع ولا توجد قاعدة بيانات خلف النموذج.',
        'البيانات الوحيدة المحفوظة في متصفحك هي اختيارك للغة، في localStorage تحت المفتاح «hydra-lang».',
      ],
    },
    {
      heading: 'لماذا، وعلى أي أساس',
      body: [
        'تُستخدَم رسالتك للرد على طلبك، ولإدارة علاقة العمل إذا تبعها مشروع. الأساس القانوني هو خطوات ما قبل التعاقد بطلب منك (المادة 6.1.b من اللائحة) والمصلحة المشروعة للاستوديو في الرد على الطلبات (المادة 6.1.f).',
        'حفظ اللغة وظيفي بحت ولا يحتاج موافقة تتجاوز اختيارك.',
      ],
    },
    {
      heading: 'مدة الحفظ',
      body: [
        'تُحذف الطلبات التي لا تؤدي إلى مشروع بعد 24 شهراً. تُحفظ مراسلات المشاريع طوال العلاقة ثم لمدة الحفظ القانونية. [TODO: تأكيد المدد مع المحاسب]',
      ],
    },
    {
      heading: 'الكوكيز وأدوات التتبع',
      body: [
        'لا إحصاءات ولا إعلانات ولا بكسلات اجتماعية ولا لافتة كوكيز، لأن الموقع لا يضع أي كوكي.',
        'تُحمَّل الخطوط من Google Fonts (fonts.googleapis.com) التي تتلقى عنوان IP الخاص بك عند تحميل الصفحة. [TODO: استضافة الخطوط محلياً لإلغاء هذا الطلب الخارجي]',
      ],
    },
    {
      heading: 'حقوقك',
      body: [
        'يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها أو نقلها، أو الاعتراض على معالجتها، بمراسلة hello@hydrasamo.com. يمكنك أيضاً تقديم شكوى إلى CNIL (www.cnil.fr).',
      ],
    },
  ],
};

export const LEGAL_PAGES: Record<Lang, { legal: LegalPage; privacy: LegalPage }> = {
  en: { legal: EN_LEGAL, privacy: EN_PRIVACY },
  fr: { legal: FR_LEGAL, privacy: FR_PRIVACY },
  ar: { legal: AR_LEGAL, privacy: AR_PRIVACY },
};
