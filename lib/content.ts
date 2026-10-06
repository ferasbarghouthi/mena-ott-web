// Editorial content (not catalog data). Legal texts are placeholders until
// the lawyer's versions arrive (PRD v1.1 §5.2).

import type { L10n } from "./api/types";

export const FAQ: { topic: "payment" | "activation" | "devices" | "refund" | "renewal"; q: L10n; a: L10n }[] = [
  {
    topic: "activation",
    q: { ar: "كيف أفعّل التلفزيون بعد الدفع؟", en: "How do I activate my TV after paying?" },
    a: {
      ar: "افتح التطبيق على التلفزيون وسيظهر كود مثل A7K9-22XP مع رابط ورمز QR. افتح صفحة التفعيل وأدخل الكود واختر اشتراكك.",
      en: "Open the app on your TV and it shows a code like A7K9-22XP with a link and a QR code. Open the activation page, enter the code and pick your subscription.",
    },
  },
  {
    topic: "activation",
    q: { ar: "هل أستطيع الدفع قبل تثبيت التطبيق؟", en: "Can I pay before installing the app?" },
    a: { ar: "نعم. ادفع الآن واربط التلفزيون لاحقاً من حسابك أو من صفحة التفعيل.", en: "Yes. Pay now and link your TV later from your account or the activation page." },
  },
  {
    topic: "activation",
    q: { ar: "ماذا يحدث إذا تم الدفع ولم يتفعّل الجهاز؟", en: "What if I paid but the device didn't activate?" },
    a: {
      ar: "دفعتك محفوظة ولا يُحسب الاشتراك فعّالاً حتى يتفعّل الجهاز. يعيد النظام المحاولة تلقائياً، وإذا استمرت المشكلة يُفتح طلب دعم باسمك.",
      en: "Your payment is safe and the subscription isn't counted as active until the device is. The system retries automatically, and if it keeps failing a support request is opened for you.",
    },
  },
  {
    topic: "devices",
    q: { ar: "ما الأجهزة المدعومة؟", en: "Which devices are supported?" },
    a: { ar: "Android TV وGoogle TV وSamsung (Tizen) وLG (webOS)، وتطبيقات Android وiOS.", en: "Android TV, Google TV, Samsung (Tizen) and LG (webOS), plus Android and iOS apps." },
  },
  {
    topic: "devices",
    q: { ar: "كم جهازاً أستطيع استخدامه؟", en: "How many devices can I use?" },
    a: { ar: "حسب الباقة. تظهر عدد الأجهزة والمشاهدات المتزامنة في صفحة كل باقة.", en: "It depends on the package. Each package page shows its devices and concurrent streams." },
  },
  {
    topic: "devices",
    q: { ar: "غيّرت التلفزيون، كيف أنقل الاشتراك؟", en: "I changed my TV. How do I move my subscription?" },
    a: {
      ar: "من صفحة أجهزتي اختر \"استبدال\" للجهاز القديم، ثم أدخل كود التلفزيون الجديد. عدد مرات الاستبدال محدد حسب الباقة.",
      en: "On My Devices choose \"Replace\" on the old device, then enter the new TV's code. The number of replacements depends on your package.",
    },
  },
  {
    topic: "payment",
    q: { ar: "ما طرق الدفع المتاحة؟", en: "Which payment methods are available?" },
    a: { ar: "البطاقات البنكية Visa وMastercard عبر صفحة دفع آمنة مع 3-D Secure. طرق محلية إضافية قريباً.", en: "Visa and Mastercard cards through a secure payment page with 3-D Secure. More local methods are coming." },
  },
  {
    topic: "payment",
    q: { ar: "هل الأسعار شاملة الضريبة؟", en: "Do prices include tax?" },
    a: { ar: "نعم، كل الأسعار المعروضة شاملة الضريبة، وتصلك فاتورة لكل دفعة.", en: "Yes, every price shown includes tax, and you get an invoice for every payment." },
  },
  {
    topic: "refund",
    q: { ar: "متى أستطيع استرداد المبلغ؟", en: "When can I get a refund?" },
    a: { ar: "إذا تعذّر تفعيل الخدمة بعد الدفع ولم نتمكن من حلها، أو حسب سياسة الاسترداد.", en: "If the service can't be activated after payment and we can't fix it, or as set out in the Refund Policy." },
  },
  {
    topic: "renewal",
    q: { ar: "كيف أجدد الاشتراك؟", en: "How do I renew?" },
    a: {
      ar: "من حسابي اضغط \"تجديد\". تُضاف المدة فوق تاريخ الانتهاء الحالي بسعر اليوم. نذكّرك قبل الانتهاء بـ 30 و7 و3 أيام ويوم واحد.",
      en: "Press \"Renew\" in your account. The time is added on top of your current expiry date at today's price. We remind you 30, 7, 3 and 1 day before expiry.",
    },
  },
];

export type LegalDoc = { version: string; updated: string; sections: { h: L10n; p: L10n }[] };

export const TERMS: LegalDoc = {
  version: "0.1",
  updated: "2026-10-06",
  sections: [
    { h: { ar: "الخدمة", en: "The service" }, p: { ar: "نوفر اشتراكات بث تلفزيوني عبر الإنترنت لقنوات مرخّصة لمنطقتك. تختلف القنوات حسب الباقة والبلد وحقوق البث.", en: "We provide online TV subscriptions for channels licensed for your region. Channels vary by package, country and rights." } },
    { h: { ar: "الحساب", en: "Your account" }, p: { ar: "يجب أن تكون بياناتك صحيحة. يُمنع مشاركة الحساب أو إعادة بيع الخدمة.", en: "Your details must be accurate. Account sharing and resale are not allowed." } },
    { h: { ar: "الأجهزة", en: "Devices" }, p: { ar: "كل باقة تحدد عدد الأجهزة والمشاهدات المتزامنة ومرات الاستبدال.", en: "Each package sets the number of devices, concurrent streams and replacements." } },
    { h: { ar: "الدفع", en: "Payment" }, p: { ar: "يبدأ الاشتراك بعد تأكيد الدفع وتفعيل الخدمة. الأسعار شاملة الضريبة وتُثبّت لحظة الشراء.", en: "A subscription starts once payment is confirmed and the service is activated. Prices include tax and are fixed at purchase." } },
  ],
};

export const PRIVACY: LegalDoc = {
  version: "0.1",
  updated: "2026-10-06",
  sections: [
    { h: { ar: "ما نجمعه", en: "What we collect" }, p: { ar: "الاسم والبريد والموبايل، بيانات الأجهزة، وسجل الاشتراكات والمدفوعات. لا نخزن بيانات البطاقة.", en: "Name, email and mobile, device data, and subscription and payment history. We never store card data." } },
    { h: { ar: "كيف نستخدمه", en: "How we use it" }, p: { ar: "لتفعيل الخدمة ومنع الاحتيال وإرسال التذكيرات وتقديم الدعم.", en: "To activate the service, prevent fraud, send reminders and provide support." } },
    { h: { ar: "مزوّد المحتوى", en: "Content provider" }, p: { ar: "نشارك فقط المعرّفات اللازمة للتفعيل.", en: "We share only the identifiers activation needs." } },
    { h: { ar: "حذف الحساب", en: "Account deletion" }, p: { ar: "يمكنك طلب حذف حسابك من صفحة الدعم.", en: "You can request account deletion from the Support page." } },
  ],
};

export const REFUND: LegalDoc = {
  version: "0.1",
  updated: "2026-10-06",
  sections: [
    { h: { ar: "تعذّر التفعيل", en: "Activation not possible" }, p: { ar: "إذا دفعت ولم نتمكن من تفعيل الخدمة، يحق لك استرداد كامل المبلغ.", en: "If you paid and we can't activate the service, you're entitled to a full refund." } },
    { h: { ar: "بعد التفعيل", en: "After activation" }, p: { ar: "شروط الاسترداد بعد بدء المشاهدة تُحدد في النص النهائي.", en: "Refund terms after viewing starts will be set in the final text." } },
    { h: { ar: "طريقة الطلب", en: "How to ask" }, p: { ar: "افتح طلب دعم بتصنيف \"الدفع\" مع رقم الطلب.", en: "Open a support request in the \"Payment\" category with your order number." } },
  ],
};
