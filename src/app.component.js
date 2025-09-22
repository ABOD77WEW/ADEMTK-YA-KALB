import { Component, ChangeDetectionStrategy, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface VerseExplanation {
  meaning: string;
  imagery?: string;
  rhetoric?: string;
  vocabulary?: { word: string; definition: string }[];
}

interface Verse {
  part1: string;
  part2: string;
  explanation: VerseExplanation;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface WheelSegment {
  path: string;
  color: string;
  textX: number;
  textY: number;
  textTransform: string;
  number: number;
  active: boolean;
}

type Tab = 'introduction' | 'poem' | 'poet' | 'glossary' | 'summary';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class AppComponent implements OnInit {
  activeTab = signal<Tab>('introduction');
  
  quizModalVisible = signal(false);
  currentQuestionIndex = signal(0);
  selectedAnswer = signal<string | null>(null);
  quizFinished = signal(false);
  score = signal(0);
  showConfetti = signal(false);

  verseViewerVisible = signal(false);
  selectedVerseIndex = signal(0);
  explanationVisible = signal(false);
  
  cardModalVisible = signal(false);
  cardModalContent = signal<{ title: string; content: string; source?: string; imageUrl?: string } | null>(null);

  // Wheel signals
  wheelModalVisible = signal(false);
  wheelSegments = signal<WheelSegment[]>([]);
  isSpinning = signal(false);
  selectedNumberFromWheel = signal<number | null>(null);
  wheelRotation = signal(0);

  wheelTransform = computed(() => `rotate(${this.wheelRotation()}deg)`);
  wheelTransition = computed(() => this.isSpinning() ? 'transform 6s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none');
  areAllSegmentsInactive = computed(() => this.wheelSegments().every(s => !s.active));


  constructor() {}

  ngOnInit(): void {
    this.initializeWheel();
  }

  readonly introduction = {
    title: 'تمهيد في غرض القصيدة',
    content: 'تُعد هذه القصيدة نموذجاً فريداً من شعر الغزل في العصر العباسي، حيث يتخذ الشاعر من قلبه خصماً يحاوره ويناجيه، وهي سمة فنية تُعرف بـ "مناجاة القلب". يعكس هذا الحوار الصراع الداخلي الذي يعيشه الشاعر بين عقله الذي يرى جفاء المحبوبة، وقلبه الذي يصر على حبها والتعلق بها. بشار بن برد، كرائد من رواد الشعر المحدث، يبرع في التعبير عن خوالج النفس بأسلوب يجمع بين جزالة اللفظ وعمق المعنى، مما يجعل هذه القصيدة رحلة نفسية في أعماق تجربة الحب المؤلم.',
    quote: 'بشار بن برد، شاعرية خصبة تذهب بالشعر كل مذهب في التعبير عن خوالج النفس، والتجاوب مع روح العصر، في حس مرهف، وقدرة على الملاءمة بين اللفظ والمعنى، وبين الصورة والموضوع.',
    quoteSource: 'طه الحاجري'
  };

  readonly introductionCardData = {
    title: this.introduction.title,
    content: `${this.introduction.content}\n\n"${this.introduction.quote}"`,
    source: this.introduction.quoteSource
  };

  readonly poet = {
    name: 'بشار بن برد',
    bio: 'أبو معاذ بشار بن برد العُقيلي (٩٦ - ١٦٨ هـ)، شاعر مطبوع من أصل فارسي، يُعد شيخ الشعراء المولدين في زمانه. وُلد أعمى، لكن ذلك لم يمنعه من امتلاك بصيرة نافذة وحس مرهف، فكان يعوض بصره المفقود بحواس أخرى قوية، مما أضفى على شعره طابعاً خاصاً. عُرف بذكائه الحاد، وسرعة بديهته، وشخصيته القوية التي تميل إلى السخرية والهجاء اللاذع أحياناً، وهو ما جلب له عداوات كثيرة. يُعتبر بشار فاتحة العصر العباسي في الشعر، حيث جدد في الأساليب والأغراض الشعرية. قُتل في أواخر حياته بتهمة الزندقة في عهد الخليفة المهدي.'
  };

  readonly poetCardData = {
    title: 'التعريف بالشاعر',
    content: this.poet.bio,
    source: "ديوان بشار بن برد، 'دار صادر' بيروت ط.١ ٢٠٠٠"
  };

  readonly summary = {
    title: "ملخص وتحليل قصيدة 'عدمتك يا قلب'",
    poetSummary: 'بشار بن برد، شاعر عباسي من أصل فارسي، وُلد أعمى لكنه امتلك بصيرة نافذة. يُعد من رواد التجديد في الشعر، وعُرف بذكائه وقوة شخصيته. قُتل بتهمة الزندقة في عهد الخليفة المهدي.',
    generalIdea: 'تدور القصيدة حول صراع الشاعر النفسي، حيث يخاطب قلبه ويلومه على خضوعه واستسلامه لمحبوبة قاسية لا تبادله الود، كاشفاً عن عذابات الحب من طرف واحد، ومقدماً في النهاية حكماً حول طبيعة القلب الميالة لمن يحب.',
    detailedIdeas: [
        { title: 'مناجاة القلب والصراع الداخلي', content: 'القصيدة مبنية على حوار بين عقل الشاعر وقلبه، مما يعكس الصراع بين المنطق والعاطفة في تجربة حب مؤلمة.' },
        { title: 'عتاب القلب واستنكار خضوعه', content: 'يبدأ الشاعر بلوم قلبه على استسلامه لمحبوبة قاسية لا تبادله الود.' },
        { title: 'وصف معاناة العاشق', content: 'يرسم الشاعر صورة دقيقة لمعاناته من الشوق الدائم، والقلق، والأرق، والعزلة.' },
        { title: 'جفاء المحبوبة وخداعها', content: 'يكشف حقيقة المحبوبة التي تقدم وعوداً كاذبة وأعذاراً واهية للتهرب من لقائه.' },
        { title: 'الحكمة المستخلصة', content: 'يقدم الشاعر حكماً حول ضرورة ترك من يجفو، ومعاملة المخادع بالمثل، والاعتراف بطبيعة القلب الميالة لمن يحب.'}
    ],
    artisticFeatures: [
        { feature: 'التشخيص', explanation: 'إضفاء الصفات الإنسانية على القلب ومخاطبته ككائن عاقل، وهو أبرز سمة فنية.' },
        { feature: 'الصور الشعرية', explanation: 'استخدام غني للاستعارات (هواك طفل) والكنايات (فَخُذ بِيَدَيكَ تُربا).' },
        { feature: 'الأساليب البلاغية', explanation: 'براعة في استخدام الاستفهام الإنكاري، والطباق (رغباً ورهبا)، والجناس.' },
    ],
    vocabulary: [
        { word: 'عَدِمتُكَ', definition: 'دعاء بالهلاك والفقد.' },
        { word: 'صَبابَةً', definition: 'حرارة الشوق ورقته.' },
        { word: 'كَرَبَتكَ', definition: 'أوقعتك في الحزن والهم.' },
        { word: 'خَبَّت', definition: 'خدعت.' },
        { word: 'جَدبا', definition: 'القحط، والمقصود الخيبة والفشل.' },
        { word: 'التَعَزّي', definition: 'التصبر والتسلي.' },
    ]
  };

  readonly poem: Verse[] = [
    { 
      part1: 'عَدِمتُكَ عاجِلاً يا قَلبُ قَلباً', 
      part2: 'أَتَجعَلُ مَن هَويتَ عَلَيكَ رَبّا',
      explanation: {
        meaning: 'يبدأ الشاعر بالدعاء على قلبه بالهلاك، متعجباً ومستنكراً كيف يخضع هذا القلب لمن يحب ويجعله سيداً ومتحكماً فيه.',
        imagery: 'يخاطب قلبه وكأنه إنسان عاقل يسمع ويفهم (تشخيص)، مما يضفي حيوية على النص.',
        rhetoric: 'يا قلبُ: أسلوب نداء غرضه اللوم والعتاب. أَتَجعَلُ: أسلوب استفهام غرضه الإنكار والتعجب.',
        vocabulary: [{ word: 'عَدِمتُكَ', definition: 'دعاء بالهلاك والفقد.' }, { word: 'رَبّا', definition: 'سيداً ومتحكماً.' }]
      }
    },
    { 
      part1: 'بِأَيِّ مَشورَةٍ وَبِأَيِّ رَأيٍ', 
      part2: 'تُمَلِّكُها وَلا تَسقيكَ عَذبا',
      explanation: {
        meaning: 'يواصل الشاعر لوم قلبه، متسائلاً عن أي عقل أو منطق جعله يسلم أمره لهذه المحبوبة التي لا تمنحه سوى الألم ولا تبادله الحب الصافي.',
        imagery: '`لا تَسقيكَ عَذبا`: كناية عن عدم مبادلتها له الحب والهناء، وصورة الحب بالماء العذب الذي يروي الظمأ.',
        rhetoric: 'بِأَيِّ مَشورَةٍ وَبِأَيِّ رَأيٍ: استفهام غرضه الحيرة واللوم، وتكرار "بأي" يفيد التأكيد على هذا اللوم.'
      }
    },
    { 
      part1: 'تَحِنُّ صَبابَةً في كُلِّ يَومٍ', 
      part2: 'إِلى حُبّى وَقَد كَرَبَتكَ كَربا',
      explanation: {
        meaning: 'يصف الشاعر حال قلبه الذي يزداد شوقاً وحنيناً كل يوم إلى حبيبته "حُبّى"، على الرغم من أنها سبب همه وحزنه الشديد.',
        rhetoric: '`كَرَبَتكَ كَربا`: استخدام المفعول المطلق للتأكيد على شدة الحزن والألم.',
        vocabulary: [{ word: 'صَبابَةً', definition: 'حرارة الشوق ورقته.' }, { word: 'كَرَبَتكَ', definition: 'أوقعتك في الكرب وهو الحزن والهم.' }]
      }
    },
    { 
      part1: 'وَتَهتَجِرُ النِساءَ إِلى هَواها', 
      part2: 'كَأَنَّكَ ضامِنٌ مِنهُنَّ نَحبا',
      explanation: {
        meaning: 'يوبخ الشاعر قلبه لأنه يهجر جميع النساء من أجل حبيبته، وكأنه قد ضمن ألا يجد فيهن من تبادله الحب أو تملأ فراغه.',
        imagery: '`كَأَنَّكَ ضامِنٌ`: تشبيه لحال القلب بحال من أخذ ضماناً أو عهداً، مما يبرز ثقته المفرطة في غير محلها.',
        vocabulary: [{ word: 'تَهتَجِرُ', definition: 'تترك وتبتعد عن.' }, { word: 'نَحبا', definition: 'النحب هو النذر أو العهد، والمقصود هنا الوفاء بالحب.' }]
      }
    },
    { 
      part1: 'أَمِن رَيحانَةٍ حَسُنَت وَطابَت', 
      part2: 'تَبيتُ مُرَوَّعاً وَتَظَلُّ صَبّا',
      explanation: {
        meaning: 'يتعجب الشاعر كيف أن قلبه يعيش في خوف دائم وشوق مستمر من أجل محبوبة جميلة ورقيقة كالريحانة.',
        imagery: '`رَيحانَةٍ`: استعارة تصريحية، حيث شبه المحبوبة بالريحانة لجمالها ورائحتها الطيبة.',
        vocabulary: [{ word: 'مُرَوَّعاً', definition: 'خائفاً وفزعاً.' }, { word: 'صَبّا', definition: 'عاشقاً وشديد الشوق.' }]
      }
    },
    { 
      part1: 'تَروعُ مِنَ الصِحابِ وَتَبتَغيها', 
      part2: 'مَعَ الوَسواسِ مُنفَرِداً مُكِبّا',
      explanation: {
        meaning: 'يصور الشاعر قلبه وهو في حالة من القلق والوحدة، حيث يخاف من رفاقه ويسعى وحيداً وراء حبيبته، غارقاً في هواجسه.',
        imagery: 'تصوير دقيق للحالة النفسية المضطربة للعاشق، حيث تجتمع فيه الوحدة والخوف والوسواس.',
        vocabulary: [{ word: 'تَروعُ', definition: 'تخاف وتفزع.' }, { word: 'مُكِبّا', definition: 'ملازماً ومنقطعاً للشيء.' }]
      }
    },
     { 
      part1: 'كَأَنَّكَ لا تَرى حَسَناً سِواها', 
      part2: 'وَلا تَلقى لَها في الناسِ ضَربا',
      explanation: {
        meaning: 'يستمر في مخاطبة قلبه قائلاً إنه قد أُعمي عن رؤية أي جمال آخر غير جمالها، ولا يجد لها مثيلاً أو شبيهاً بين الناس.',
        imagery: '`كَأَنَّكَ لا تَرى`: تشبيه لحال القلب بحال الأعمى الذي لا يبصر إلا شيئاً واحداً.',
        vocabulary: [{ word: 'ضَربا', definition: 'مثيلاً أو شبيهاً.' }]
      }
    },
    { 
      part1: 'وَكَم مِن غَمرَةٍ وَجَوازِ فَينٍ', 
      part2: 'خَلَوتَ بِهِ فَهَل تَزدادُ قُربا',
      explanation: {
        meaning: 'يذكّر قلبه بالعديد من الصعاب والظلمات التي واجهها في سبيلها، متسائلاً بسخرية إن كان كل ذلك قد زاده قرباً منها.',
        rhetoric: '`فَهَل تَزدادُ قُربا`: استفهام غرضه النفي والإنكار، أي أنك لم تزدد قرباً.',
        vocabulary: [{ word: 'غَمرَةٍ', definition: 'شدة وضيق.' }, { word: 'فَينٍ', definition: 'ظل الشجر، والمقصود هنا مكان الخلوة.' }]
      }
    },
    { 
      part1: 'بَكَيتَ مِنَ الهَوى وَهَواكَ طِفلٌ', 
      part2: 'فَوَيلَكَ ثُمَّ وَيلَكَ حينَ شَبّا',
      explanation: {
        meaning: 'يقول لقلبه إنك تبكي وتتألم من الحب وهو لا يزال في بداياته، فيا ويلك من العذاب حين يشتد هذا الحب ويقوى.',
        rhetoric: '`فَوَيلَكَ ثُمَّ وَيلَكَ`: تكرار للتهديد والوعيد، يؤكد على شدة الألم القادم.',
        imagery: '`هَواكَ طِفلٌ`: استعارة مكنية، شبه الهوى بالطفل الذي ينمو ويكبر.'
      }
    },
     { 
      part1: 'إِذا أَصبَحتَ صَبَّحَكَ التَصابي', 
      part2: 'وَأَطرابٌ تُصَبُّ عَلَيكَ صَبّا',
      explanation: {
        meaning: 'يصف الملازمة الدائمة للأحزان، فما إن يبدأ يومه حتى تهاجمه أشواق الصبا وأحزانه التي تنصب عليه انصباباً.',
        rhetoric: '`صَبَّحَكَ التَصابي`: جناس اشتقاق بين "أصبحت" و "صبحك". `تُصَبُّ ... صَبّا`: مفعول مطلق لتأكيد شدة المعاناة.',
        vocabulary: [{ word: 'التَصابي', definition: 'تكلف الصبا واللهو.' }, { word: 'أَطرابٌ', definition: 'مفردها طرب، والمقصود هنا الهموم والأحزان.' }]
      }
    },
     { 
      part1: 'وَتُمسي وَالمَساءُ عَلَيكَ مُرٌّ', 
      part2: 'يُقَلِّبُكَ الهَوى جَنباً فَجَنبا',
      explanation: {
        meaning: 'وكما يبدأ يومه بالألم، ينهيه كذلك، حيث يأتي المساء مريرًا عليه، ويبقى الحب يقلبه على فراش الأرق فلا ينام.',
        imagery: '`يُقَلِّبُكَ الهَوى`: تشخيص للهوى، حيث صوره كشخص يسيطر على العاشق ويمنعه من الراحة.'
      }
    },
    { 
      part1: 'أَظُنُّكَ مِن حِذارِ البَينِ يَوماً', 
      part2: 'بِداءِ الحُبِّ سَوفَ تَموتُ رُعبا',
      explanation: {
        meaning: 'يتوقع الشاعر أن نهاية قلبه ستكون الموت خوفاً ورعباً من فراق الحبيبة، بسبب داء الحب الذي أصابه.',
        imagery: '`داءِ الحُبِّ`: تشبيه بليغ للحب بالمرض العضال الذي يؤدي إلى الموت.',
        vocabulary: [{ word: 'حِذارِ البَينِ', definition: 'الخوف من الفراق.' }]
      }
    },
    { 
      part1: 'أَتُظهِرُ رَهبَةً وَتُسِرُّ رَغباً', 
      part2: 'لَقَد عَذَّبتَني رَغباً وَرَهبا',
      explanation: {
        meaning: 'يستنكر الشاعر التناقض في حال قلبه الذي يظهر الخوف من الحب ولكنه يخفي رغبة شديدة فيه، وهذا التناقض هو ما يعذب الشاعر.',
        rhetoric: 'بين `رَهبَةً` و `رَغباً` طباق يوضح التناقض ويزيد المعنى قوة.',
      }
    },
    { 
      part1: 'فَما لَكَ في مَوَدَّتِها نَصيبٌ', 
      part2: 'سِوى عِدَةٍ فَخُذ بِيَدَيكَ تُربا',
      explanation: {
        meaning: 'يخبر قلبه بشكل قاطع أنه لا نصيب له في حبها إلا الوعود الكاذبة، وينصحه بأن ييأس ويترك هذا الأمل.',
        imagery: '`فَخُذ بِيَدَيكَ تُربا`: كناية عن الخيبة والفشل الذريع، وهو تعبير يدل على اليأس المطلق.',
        vocabulary: [{ word: 'عِدَةٍ', definition: 'وعد كاذب.' }]
      }
    },
    { 
      part1: 'إِذا وُدٌّ جَفا وَأَرَبَّ وُdٌّ', 
      part2: 'فَجانِب مَن جَفاكَ لِمَن أَرَبّا',
      explanation: {
        meaning: 'يقدم حكمة لقلبه، وهي أنه إذا تعرض للجفاء من حبيب، ووجد حباً آخر باقياً ومقيماً، فعليه أن يترك من جفاه ويتجه لمن أظهر له الود.',
        rhetoric: 'بين `جَفا` و `أَرَبَّ` طباق. والبيت كله يجري مجرى الحكمة.',
        vocabulary: [{ word: 'جَفا', definition: 'ابتعد وأعرض.' }, { word: 'أَرَبَّ', definition: 'أقام ومكث.' }]
      }
    },
    { 
      part1: 'وَدَع شَغبَ البَخيلِ إِذا تَمادى', 
      part2: 'فَإِنَّ لَهُ مَعَ المَعروفِ شَغبا',
      explanation: {
        meaning: 'ينصح قلبه بترك من يبخل بمشاعره ويتمادى في إثارة المشاكل، لأن طبع هذا البخيل هو إثارة الشر حتى مع من يقدم له الخير.',
        vocabulary: [{ word: 'شَغبَ', definition: 'إثارة الشر والفتنة.' }, { word: 'تمادى', definition: 'استمر في غيّه وتجاوز الحد.' }]
      }
    },
     { 
      part1: 'وَقالَت لا تَزالُ عَلَيَّ عَينٌ', 
      part2: 'أُراقِبُ قَيِّماً وَأَخافُ كَلبا',
      explanation: {
        meaning: 'ينتقل هنا ليحكي عن أعذار حبيبته، فهي تدعي أنها مراقبة دائماً من قيمها (ولي أمرها) أو من كلب حراسة، لتبرر عدم لقائه.',
        imagery: '`عَلَيَّ عَينٌ`: كناية عن المراقبة الشديدة. `كَلبا`: قد تكون كلمة حقيقية أو كناية عن حارس بغيض.',
        vocabulary: [{ word: 'قَيِّماً', definition: 'الولي أو المسؤول عن الأمر.' }]
      }
    },
    { 
      part1: 'لَقَد خَبَّت عَلَيكَ وَأَنتَ ساهٍ', 
      part2: 'فَكُن خِبّاً إِذا لاقَيتَ خِبّا',
      explanation: {
        meaning: 'يكشف الشاعر حقيقة خداعها له وهو غافل، ثم يقدم نصيحة بأن يكون خادعاً وماكراً عندما يقابل شخصاً خادعاً.',
        rhetoric: 'البيت يجري مجرى الحكمة (عامل الناس بمثل ما يعاملوك به). بين `خَبَّت` و `خِبّاً` جناس اشتقاق.',
        vocabulary: [{ word: 'خَبَّت', definition: 'خدعت.' }, { word: 'ساهٍ', definition: 'غافل.' }, { word: 'خِبّاً', definition: 'مخادعاً.' }]
      }
    },
    { 
      part1: 'وَلا تَغرُركَ مَوعِدَةٌ لِحُبّى', 
      part2: 'فَإِنَّ عِداتِها أَنزَلنَ جَدبا',
      explanation: {
        meaning: 'يحذر قلبه مرة أخرى من الاغترار بوعودها، لأن هذه الوعود لا تجلب إلا القحط والخيبة، ولا خير فيها.',
        imagery: '`أَنزَلنَ جَدبا`: استعارة، حيث شبه خيبة الأمل الناتجة عن وعودها بالقحط والجدب الذي لا حياة فيه.',
        vocabulary: [{ word: 'جَدبا', definition: 'القحط وعدم الخصب.' }]
      }
    },
    { 
      part1: 'أَلا يا قَلبُ هَل لَكَ في التَعَزّي', 
      part2: 'فَقَد عَذَّبتَني وَلَقيتُ حَسبا',
      explanation: {
        meaning: 'يعود الشاعر لمخاطبة قلبه، ويعرض عليه أن يتصبر ويتسلى عن هذا الحب، فقد تسبب في عذاب شديد للشاعر وكفاه ما لاقى من ألم.',
        rhetoric: '`أَلا يا قَلبُ`: نداء للتنبيه. `هَل لَكَ في التَعَزّي`: استفهام غرضه الحث والتمني.',
        vocabulary: [{ word: 'التَعَزّي', definition: 'التصبر والتسلي.' }, { word: 'حَسبا', definition: 'كفاية، أي كفاك ما عانيت.' }]
      }
    },
    { 
      part1: 'وَما أَصبَحتَ تَأمُلُ مِن صَديقٍ', 
      part2: 'يَعُدُّ عَلَيكَ طولَ الحُبِّ ذَنبا',
      explanation: {
        meaning: 'يتساءل الشاعر مستنكراً: ماذا يمكن أن يأمل من صديق (ويقصد قلبه) يعتبر إخلاصه ووفاءه في الحب ذنباً وجريمة؟',
        rhetoric: 'استفهام غرضه التعجب والإنكار.'
      }
    },
    { 
      part1: 'كَأَنَّكَ قَد قَتَلتَ لَهُ قَتيلاً', 
      part2: 'بِحُبِّكَ أَو جَنَيتَ عَلَيهِ حَربا',
      explanation: {
        meaning: 'يصور الشاعر مدى عداوة قلبه له، فكأن الشاعر قد ارتكب جريمة قتل أو أشعل حرباً ضد قلبه بسبب هذا الحب.',
        imagery: 'تشبيه تمثيلي، حيث شبه حالته مع قلبه الذي يعاديه بسبب الحب، بحالة من ارتكب جريمة كبرى ضد شخص آخر.'
      }
    },
    { 
      part1: 'رَأَيتُ القَلبَ لا يَأتي بَغيضاً', 
      part2: 'وَيُؤثِرُ بِالزِيارَةِ مَن أَحَبّا',
      explanation: {
        meaning: 'يختتم الشاعر القصيدة بحقيقة توصل إليها، وهي أن القلب بطبيعته لا يميل لمن يبغضه، بل يختار دائماً زيارة ووصل من يحبه، وكأنه يبرر لقلبه فعله.',
        rhetoric: 'البيت يجري مجرى الحكمة، ويلخص الطبيعة البشرية للقلب.'
      }
    }
  ];

  readonly glossary: GlossaryTerm[] = [
    { term: 'صبابة', definition: 'الشوق أو رقته وحرارته.' },
    { term: 'كرب', definition: 'الحزن والهم يأخذ بالنفس.' },
    { term: 'غمرة', definition: 'الشدة.' },
    { term: 'جوى', definition: 'شدة الوجد من عشق أو حزن.' },
    { term: 'التصابي', definition: 'تكلف الصبى.' },
    { term: 'أطراب', definition: 'مفردها (الطرب): خفة وهزة تثير النفس لفرح أو حزن والمقصود هنا الحزن.' },
    { term: 'عِدة', definition: 'الموعد أو الوعد أو العهد.' },
    { term: 'أَرَبّ', definition: 'مكث وأقام.' },
    { term: 'شغب', definition: 'تهييج الشر، وإثارة الفتن والاضطراب.' },
    { term: 'خَبَّت', definition: 'خَدعت - الخب: المخادع.' },
    { term: 'جَدبا', definition: 'القحط وعدم الخصب.' },
    { term: 'التَعَزّي', definition: 'التصبر والتسلي.' },
  ];
  
  readonly quizQuestions: QuizQuestion[] = [
    {
      question: 'في البيت الأول "عَدِمتُكَ... أَتَجعَلُ مَن هَويتَ عَلَيكَ رَبّا"، ما هو الغرض من الاستفهام؟',
      options: ['التقرير والتأكيد', 'النفي والتكذيب', 'الإنكار والتعجب', 'التمني والرجاء'],
      answer: 'الإنكار والتعجب',
    },
    {
      question: 'ما معنى كلمة "صبابة" في البيت "تَحِنُّ صَبابَةً في كُلِّ يَومٍ"؟',
      options: ['حزن شديد', 'شوق ورقة', 'قوة وعزيمة', 'تعب وإرهاق'],
      answer: 'شوق ورقة',
    },
    {
      question: 'ما الأسلوب البلاغي الأبرز في الشطر "لَقَد عَذَّبتَني رَغباً وَرَهبا"؟',
      options: ['مقابلة', 'طباق', 'جناس', 'سجع'],
      answer: 'طباق',
    },
    {
      question: 'بمَ توعّد الشاعر قلبه في البيت "بَكَيتَ مِنَ الهَوى وَهَواكَ طِفلٌ ... فَوَيلَكَ ثُمَّ وَيلَكَ حينَ شَبّا"؟',
      options: ['بأن الحب سيصبح أسهل', 'بأن حبيبته ستعود إليه', 'بأن عذاب الحب سيزداد ويشتد', 'أنه سينسى هذا الحب'],
      answer: 'بأن عذاب الحب سيزداد ويشتد',
    },
    {
      question: 'الكناية في قول الشاعر "فَخُذ بِيَدَيكَ تُربا" تدل على:',
      options: ['الفوز العظيم', 'الحزن الشديد', 'الندم والتوبة', 'الخيبة والفشل المطلق'],
      answer: 'الخيبة والفشل المطلق',
    },
    {
      question: 'ما الحكمة التي يدعو إليها الشاعر في "فَكُن خِبّاً إِذا لاقَيتَ خِبّا"؟',
      options: ['التسامح مع الأعداء', 'معاملة المخادع بنفس أسلوبه', 'تجنب الناس جميعاً', 'الصدق في كل الأحوال'],
      answer: 'معاملة المخادع بنفس أسلوبه',
    },
    {
      question: 'ما الصورة الجمالية في قول الشاعر عن وعود حبيبته "فَإِنَّ عِداتِها أَنزَلنَ جَدبا"؟',
      options: ['شبه الوعود بالمطر الغزير', 'شبه خيبة الأمل بالقحط والجفاف', 'شبه الوعود بالزرع الأخضر', 'شبه خيبة الأمل بالبحر الهائج'],
      answer: 'شبه خيبة الأمل بالقحط والجفاف',
    },
    {
      question: 'ما الغرض من الاستفهام في "أَلا يا قَلبُ هَل لَكَ في التَعَZّي"؟',
      options: ['النفي والإنكار', 'التقرير والتأكيد', 'الحث والتمني', 'السخرية والتهكم'],
      answer: 'الحث والتمني',
    },
    {
      question: 'من المقصود بكلمة "قَيِّم" في قول الحبيبة "أُراقِبُ قَيِّماً وَأَخافُ كَلبا"؟',
      options: ['صديق الشاعر', 'الولي أو المسؤول عنها', 'حارس القصر', 'كلب الحراسة'],
      answer: 'الولي أو المسؤول عنها',
    },
    {
      question: 'ما الحقيقة التي توصل إليها الشاعر عن طبيعة القلب في نهاية القصيدة؟',
      options: ['أن القلب يميل لمن يبغضه', 'أنه يمكن إجبار القلب على الحب', 'أن القلب بطبيعته يميل لمن يحبه', 'أن القلب متقلب ولا أمان له'],
      answer: 'أن القلب بطبيعته يميل لمن يحبه',
    }
  ];

  setActiveTab(tab: Tab) {
    this.activeTab.set(tab);
  }

  openQuiz() {
    this.quizModalVisible.set(true);
  }

  closeQuiz() {
    this.quizModalVisible.set(false);
    this.showConfetti.set(false);
    setTimeout(() => this.resetQuiz(), 300);
  }

  selectAnswer(option: string) {
    if (this.selectedAnswer()) return;

    this.selectedAnswer.set(option);
    const currentQuestion = this.quizQuestions[this.currentQuestionIndex()];
    
    if (option === currentQuestion.answer) {
      this.score.update(s => s + 1);
      setTimeout(() => {
        if (this.currentQuestionIndex() < this.quizQuestions.length - 1) {
          this.currentQuestionIndex.update(i => i + 1);
          this.selectedAnswer.set(null);
        } else {
          this.quizFinished.set(true);
          this.showConfetti.set(true);
        }
      }, 1500);
    } else {
      setTimeout(() => {
        this.selectedAnswer.set(null);
      }, 1000);
    }
  }

  resetQuiz() {
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(null);
    this.quizFinished.set(false);
    this.score.set(0);
  }

  openVerseViewer(index: number) {
    this.selectedVerseIndex.set(index);
    this.verseViewerVisible.set(true);
    this.explanationVisible.set(false);
    setTimeout(() => {
      const element = document.getElementById(`verse-${index}`);
      element?.scrollIntoView({ behavior: 'auto' });
    }, 0);
  }

  closeVerseViewer() {
    this.verseViewerVisible.set(false);
  }
  
  toggleExplanation() {
    this.explanationVisible.update(v => !v);
  }

  openCardModal(data: { title: string; content: string; source?: string; imageUrl?: string }) {
    this.cardModalContent.set(data);
    this.cardModalVisible.set(true);
  }

  closeCardModal() {
    this.cardModalVisible.set(false);
  }

  getHighlightedVersePart(part: string): (string | { word: string; def: string })[] {
    const glossaryTerms = this.glossary.map(g => g.term);
    const regex = new RegExp(`(${glossaryTerms.join('|')})`, 'g');
    const parts = part.split(regex);
    return parts.map(p => {
      const term = this.glossary.find(g => g.term === p);
      return term ? { word: p, def: term.definition } : p;
    });
  }

  isObject(item: any): item is { word: string, def: string } {
    return typeof item === 'object' && item !== null;
  }

  getOptionClass(option: string): string {
    const selected = this.selectedAnswer();
    if (selected === null) {
      return 'bg-[#2c2c2c]/50 border-2 border-[#c9a969]/40';
    }

    const isSelected = option === selected;
    if (!isSelected) {
      return 'bg-[#2c2c2c]/30 border-2 border-[#c9a969]/20 opacity-60';
    }

    const currentQuestion = this.quizQuestions[this.currentQuestionIndex()];
    const isCorrect = option === currentQuestion.answer;

    if (isCorrect) {
      return 'bg-green-600/90 text-white font-bold border-green-400 scale-105 shadow-lg shadow-green-500/30 animate-tada';
    } else {
      return 'bg-red-600/90 text-white font-bold border-red-400 animate-shake-horizontal';
    }
  }

  // Wheel Methods
  initializeWheel(): void {
    const segments: WheelSegment[] = [];
    const numSegments = 34;
    const angleStep = 360 / numSegments;
    const radius = 200;
    const center = 210;
    const colors = ['#c9a969', '#fce5ad', '#E6B325', '#f0e6d2'];
  
    for (let i = 0; i < numSegments; i++) {
      const angleStart = i * angleStep;
      const angleEnd = (i + 1) * angleStep;
      
      const startRad = (angleStart - 90) * Math.PI / 180;
      const endRad = (angleEnd - 90) * Math.PI / 180;
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);
      const largeArcFlag = angleStep > 180 ? 1 : 0;
      const path = `M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;
      
      const textAngle = angleStart + angleStep / 2;
      const textAngleRad = (textAngle - 90) * Math.PI / 180;
      const textRadius = radius * 0.75;
      const textX = center + textRadius * Math.cos(textAngleRad);
      const textY = center + textRadius * Math.sin(textAngleRad);
      const textTransform = `rotate(${textAngle}, ${textX}, ${textY})`;
  
      segments.push({
        path,
        color: colors[i % colors.length],
        number: i + 1,
        textX,
        textY,
        textTransform,
        active: true,
      });
    }
    this.wheelSegments.set(segments);
    this.wheelRotation.set(0);
    this.selectedNumberFromWheel.set(null);
  }

  openWheel() {
    this.quizModalVisible.set(false);
    this.wheelModalVisible.set(true);
  }

  closeWheel() {
    this.wheelModalVisible.set(false);
    this.quizModalVisible.set(true);
  }

  spinWheel() {
    if (this.isSpinning()) return;

    const activeSegments = this.wheelSegments().filter(s => s.active);
    if (activeSegments.length === 0) return;

    this.isSpinning.set(true);
    this.selectedNumberFromWheel.set(null);

    const randomIndex = Math.floor(Math.random() * activeSegments.length);
    const selectedSegment = activeSegments[randomIndex];
    const selectedNumber = selectedSegment.number;

    const segmentIndex = this.wheelSegments().findIndex(s => s.number === selectedNumber);
    const segmentAngle = 360 / 34;
    
    // Calculate final rotation
    const fullSpins = (Math.floor(Math.random() * 4) + 5) * 360; // 5 to 8 full spins
    const targetCorrection = (segmentIndex * segmentAngle) + (segmentAngle / 2); // Center the segment under the pointer
    const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8); // Add slight randomness to where it lands
    
    let currentRotation = this.wheelRotation() % 360;
    if (currentRotation < 0) currentRotation += 360;
    
    const finalAngle = fullSpins - targetCorrection + randomOffset;
    this.wheelRotation.set(this.wheelRotation() - (this.wheelRotation() % 360) + finalAngle);

    setTimeout(() => {
      this.isSpinning.set(false);
      this.selectedNumberFromWheel.set(selectedNumber);
      this.wheelSegments.update(segments =>
        segments.map(s => s.number === selectedNumber ? { ...s, active: false } : s)
      );
    }, 6000); // Must match animation duration
  }
}
