from django.shortcuts import render, redirect, get_object_or_404
from django.http import StreamingHttpResponse, JsonResponse
    
from django.utils import timezone
from django.conf import settings

from .forms import Crop_details_from
from .models import Crop_details

from . forms import Crop_advice_from
from . models import Crop_advice 


from google import genai
from google.genai import types
import mimetypes
import logging
import time
import markdown
import json
import random

def home(request):
    return render(request,"home.html")
def crop_advice(request):
    if request.method == "POST":
        lang=request.POST.get("language")
        request.session["lang"]=lang
        form = Crop_advice_from(request.POST)
        if form.is_valid():
            Crop_advice.objects.all().delete()
            crop=form.save()
            request.session["crop_data"] = crop.id
            return redirect("crop_advice_result")
            
    else:
        form = Crop_advice_from()
    return render(request,"crop_advice.html",{"form": form})

def crop_advice_result(request):
    crop_id = request.session.get("crop_data")
    if not crop_id:
        return redirect("crop_advice")
    crop = get_object_or_404(Crop_advice, id=crop_id)
    return render(request, "result.html", {"crop": crop})

def crop_advice_generate(request):
    crop_id = request.session.get("crop_data")
    if not crop_id:
        return JsonResponse({"error": "Crop information not found."}, status=400)
    crop = get_object_or_404(Crop_advice, id=crop_id)

    # GEMINI CLIENT
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    # GEMINI PROMPT
    prompt = f"""


"""
    def generate_stream():
        full_result = ""
        try:
            response = client.models.generate_content_stream(
                model="gemini-3.6-flash",
                contents=[prompt],
                config=types.GenerateContentConfig(automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True))
            )
            for chunk in response:
                text = getattr(chunk, "text", "")
                if not text:
                    continue
                full_result += text
                yield (json.dumps({"type": "text", "content": text}, ensure_ascii=False) + "\n")

            result_html = markdown.markdown(full_result, extensions=["extra", "tables", "sane_lists"])
            request.session["result_html"] = result_html
            request.session.modified = True
            yield (json.dumps({"type": "complete"}) + "\n")
        except Exception as error:
            print("exception ", error)
            yield (json.dumps({"type": "error", "message": "AI analysis failed. Please try again."}) + "\n")

        response = StreamingHttpResponse(generate_stream(), content_type="application/x-ndjson")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
    
def crop_doctor(request):
    print(request.method =='POST')
    if request.method == "POST":
        lang=request.POST.get("language")
        request.session["lang"]=lang
        form = Crop_details_from(request.POST,request.FILES)
        if form.is_valid():
            Crop_details.objects.all().delete()
            crop=form.save()
            request.session["crop_data"] = crop.id
            print("testing")
            return redirect("crop_images")
    else:
        form = Crop_details_from()
    return render(request,"crop_doctor.html",{"form": form})
def crop_images(request):
    crop_id=request.session.get("crop_data")
    if not crop_id:
        return redirect("crop_doctor")
    crop=Crop_details.objects.get(id=crop_id)
    if request.method == "POST":
        crop.disease_img_1 = request.FILES.get("disease_img_1")
        crop.disease_img_2 = request.FILES.get("disease_img_2")
        crop.disease_img_3 = request.FILES.get("disease_img_3")
        crop.disease_img_4 = request.FILES.get("disease_img_4")
        crop.save()
        return redirect("result")
    return render(request,"crop_doctor_imgs.html",{"form": crop})

# RESULT PAGE

def disease_solution(request):

    crop_id = request.session.get("crop_data")

    if not crop_id:
        return redirect("crop_doctor")

    crop = get_object_or_404(Crop_details,id=crop_id)

    return render(request,"result.html",{"crop": crop,"report_date": timezone.localtime()})


# GENERATE AI CROP ADVISORY


def generate_crop_advice(request):

    crop_id = request.session.get("crop_data")
    if not crop_id:
        return JsonResponse({"error": "Crop information not found."},status=400)
    crop = get_object_or_404(Crop_details,id=crop_id)

    # GEMINI CLIENT
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    # CROP IMAGE INFORMATION
    crop_images = [crop.disease_img_1,crop.disease_img_2,crop.disease_img_3,crop.disease_img_4]

    # GEMINI PROMPT
    raw_language = request.session.get("lang", "en")
    LANGUAGE_MAP = {
                    "en": "English",
                    "en-IN": "English",
                    "English": "English",

                    "te": "Telugu",
                    "te-IN": "Telugu",
                    "Telugu": "Telugu",

                    "hi": "Hindi",
                    "hi-IN": "Hindi",
                    "Hindi": "Hindi",
                }
    selected_language = LANGUAGE_MAP.get(raw_language,"English")
    print("🌐 Raw language:", raw_language)
    print("🌐 Selected AI language:", selected_language)
    LANGUAGE_TEXT = {

    "English": {

        "section_3": "3. Possible Disease or Crop Problem",
        "section_4": "4. Symptoms Identified",
        "section_5": "5. Sequential 3-Treatment ZBNF / Natural Farming Schedule",
        "section_6": "6. Treatment Summary Table",

        "most_likely": "Most Likely Problem",
        "confidence": "Confidence",
        "why": "Why",
        "alternatives": "Alternative Possibilities",

        "image_symptoms": "Image-Observed Symptoms",
        "farmer_symptoms": "Farmer-Reported Symptoms",
        "check_symptoms": "Symptoms to Check",

        "treatment": "Treatment",
        "purpose": "Purpose",
        "natural_input": "Natural Input / Practice",
        "why_treatment": "Why This Treatment",
        "preparation": "Preparation",
        "spray_dilution": "Spray Dilution",
        "per_litre": "Per 1 Litre",
        "per_acre": "Per 1 Acre",
        "drip_soil": "Drip / Soil Application",
        "application_method": "Application Method",
        "spray_time": "Spray Time",
        "monitoring": "Monitoring",

        "early_morning": "Early Morning",
        "late_afternoon": "Late Afternoon",
        "evening": "Evening",
        "not_required": "Not Required",

        "high": "High",
        "moderate": "Moderate",
        "low": "Low",
    },


    "Telugu": {

        "section_3": "3. సాధ్యమైన వ్యాధి లేదా పంట సమస్య",
        "section_4": "4. గుర్తించిన లక్షణాలు",
        "section_5": "5. వరుసగా 3 దశల ZBNF / ప్రకృతి వ్యవసాయ చికిత్స ప్రణాళిక",
        "section_6": "6. చికిత్సల సారాంశ పట్టిక",

        "most_likely": "ప్రధానంగా కనిపిస్తున్న సమస్య",
        "confidence": "నమ్మక స్థాయి",
        "why": "కారణాలు",
        "alternatives": "ఇతర సాధ్యమైన సమస్యలు",

        "image_symptoms": "చిత్రంలో గమనించిన లక్షణాలు",
        "farmer_symptoms": "రైతు తెలిపిన లక్షణాలు",
        "check_symptoms": "పరిశీలించాల్సిన లక్షణాలు",

        "treatment": "చికిత్స",
        "purpose": "ఉద్దేశ్యం",
        "natural_input": "సహజ పద్ధతి / ఇన్‌పుట్",
        "why_treatment": "ఈ చికిత్స ఎందుకు",
        "preparation": "తయారీ విధానం",
        "spray_dilution": "పిచికారీ ద్రావణం",
        "per_litre": "1 లీటర్‌కు",
        "per_acre": "1 ఎకరానికి",
        "drip_soil": "డ్రిప్ / నేల ద్వారా వినియోగం",
        "application_method": "వినియోగించే విధానం",
        "spray_time": "పిచికారీ సమయం",
        
        "monitoring": "పర్యవేక్షణ",

        "early_morning": "ఉదయం",
        "late_afternoon": "సాయంత్రం",
        "evening": "సాయంత్రం",
        "not_required": "అవసరం లేదు",

        "high": "అధికం",
        "moderate": "మధ్యస్థం",
        "low": "తక్కువ",
    },


    "Hindi": {

        "section_3": "3. संभावित रोग या फसल समस्या",
        "section_4": "4. पहचाने गए लक्षण",
        "section_5": "5. क्रमिक 3-चरणीय ZBNF / प्राकृतिक खेती उपचार योजना",
        "section_6": "6. उपचार सारांश तालिका",

        "most_likely": "सबसे संभावित समस्या",
        "confidence": "विश्वास स्तर",
        "why": "कारण",
        "alternatives": "अन्य संभावित समस्याएँ",

        "image_symptoms": "चित्र में दिखाई देने वाले लक्षण",
        "farmer_symptoms": "किसान द्वारा बताए गए लक्षण",
        "check_symptoms": "जाँच किए जाने वाले लक्षण",

        "treatment": "उपचार",
        "purpose": "उद्देश्य",
        "natural_input": "प्राकृतिक इनपुट / पद्धति",
        "why_treatment": "यह उपचार क्यों",
        "preparation": "तैयारी विधि",
        "spray_dilution": "छिड़काव घोल",
        "per_litre": "प्रति 1 लीटर",
        "per_acre": "प्रति 1 एकड़",
        "drip_soil": "ड्रिप / मिट्टी में प्रयोग",
        "application_method": "प्रयोग विधि",
        "spray_time": "छिड़काव का समय",
        "monitoring": "निगरानी",

        "early_morning": "सुबह",
        "late_afternoon": "दोपहर बाद",
        "evening": "शाम",
        "not_required": "आवश्यक नहीं",

        "high": "उच्च",
        "moderate": "मध्यम",
        "low": "कम",
    }}


    T = LANGUAGE_TEXT[selected_language]


    prompt = f"""
You are SNAP-HEAL CROP DOCTOR, an agricultural decision-support AI
specialized in crop disease diagnosis and ZBNF / Natural Farming.

Your task is to analyze the farmer's crop information and uploaded
crop photographs and generate a practical, evidence-based,
farmer-usable crop health report.

============================================================
1. SELECTED LANGUAGE — ABSOLUTE RULE
============================================================

Selected language:

{selected_language}

The COMPLETE FINAL RESPONSE MUST be written ONLY in the selected
language.

This is an absolute requirement.

If selected_language = English:
    Write everything in English.

If selected_language = Telugu:
    Write everything in Telugu.

If selected_language = Hindi:
    Write everything in Hindi.

NEVER MIX LANGUAGES.

The language rule applies to:

- headings
- subheadings
- diagnosis
- confidence
- explanations
- symptoms
- treatment names
- preparation instructions
- ingredient descriptions
- quantities descriptions
- application instructions
- spray instructions
- drip instructions
- monitoring instructions
- warnings
- table headers
- table contents
- timing
- recommendations

Do NOT provide translations in brackets.

Do NOT write:

తెలుగు పదం (English Translation)

Do NOT write:

English Word (తెలుగు పదం)

Use only the selected language.

IMPORTANT:

English words inside this prompt are instructions only.
They MUST NOT automatically appear in the final response.

Use the localized labels supplied through T.

============================================================
2. LOCALIZED OUTPUT LABELS
============================================================

Use ONLY these labels in the final response.

SECTION 3:
{T["section_3"]}

SECTION 4:
{T["section_4"]}

SECTION 5:
{T["section_5"]}

SECTION 6:
{T["section_6"]}

DIAGNOSIS:

{T["most_likely"]}
{T["confidence"]}
{T["why"]}
{T["alternatives"]}

SYMPTOMS:

{T["image_symptoms"]}
{T["farmer_symptoms"]}
{T["check_symptoms"]}

TREATMENT:

{T["treatment"]}
{T["purpose"]}
{T["natural_input"]}
{T["why_treatment"]}
{T["preparation"]}
{T["spray_dilution"]}
{T["per_litre"]}
{T["per_acre"]}
{T["drip_soil"]}
{T["application_method"]}
{T["spray_time"]}
{T["monitoring"]}

CONFIDENCE:

{T["high"]}
{T["moderate"]}
{T["low"]}

NOT APPLICABLE:

{T["not_required"]}

Never replace these localized labels with English labels when
English is not the selected language.

============================================================
3. FARMER DATA
============================================================

Crop:
{crop.crop_name}

Crop Age:
{crop.crop_age}

Farm Location:
{crop.location}

Farmer-Reported Problem:
{crop.disease}

Use this information for diagnosis.

Do NOT repeat the above information as separate sections because
the website already displays it.

============================================================
4. IMAGE ANALYSIS
============================================================

Analyze ALL uploaded crop images.

Use actual visual evidence.

Compare all available images.

Do NOT diagnose only from the farmer's description.

Do NOT assume that the farmer's stated disease is correct.

Do NOT invent symptoms.

Only report a symptom as "observed in the image" if it is actually
visible.

If the image is unclear, say that the symptom cannot be visually
confirmed.

Separate:

A. Symptoms actually visible in the images.
B. Symptoms reported by the farmer.
C. Symptoms that the farmer should inspect manually.

Never convert a symptom that needs inspection into a confirmed
symptom.

============================================================
5. DIAGNOSIS
============================================================

Determine the most likely crop problem using:

- crop
- crop age
- location
- farmer-reported problem
- uploaded images
- visible symptoms
- disease pattern
- pest pattern
- plant condition
- environmental conditions when available
- irrigation conditions when available
- soil information when available

Possible categories include:

- fungal disease
- bacterial disease
- viral disease
- insect pest
- mite problem
- nutrient deficiency
- nutrient imbalance
- soil problem
- root-zone problem
- water stress
- heat stress
- physiological disorder
- multiple problems

Do NOT force a diagnosis.

If the evidence is insufficient, clearly state that the diagnosis
cannot be confirmed from the available information.

============================================================
6. APPROVED ZBNF / NATURAL FARMING LIBRARY
============================================================

You are restricted to the following approved Natural Farming
inputs/practices.

Do NOT invent or introduce additional ZBNF products.

------------------------------------------------------------
SEED TREATMENT
------------------------------------------------------------

1. Beejamrit / Beejamrutha

------------------------------------------------------------
GROWTH PROMOTION / SOIL FERTILITY
------------------------------------------------------------

2. Jeevamrit / Jeevamrutha
3. Ghanjeevamrit / Ghana Jeevamrutha
4. Sonthastra / Sonthastar

------------------------------------------------------------
FUNGAL / DISEASE MANAGEMENT
------------------------------------------------------------

5. Beejamrit / Beejamrutha
6. Sour Buttermilk / Khatti Lassi
7. Sonthastra / Sonthastar

------------------------------------------------------------
INSECT / PEST MANAGEMENT
------------------------------------------------------------

8. Neemastra
9. Agniastra
10. Brahmastra
11. Dashparni Kwath / Dashparni Ark

============================================================
7. PRODUCT SELECTION RULE
============================================================

Do NOT recommend all products.

Select the product ONLY according to the diagnosed problem.

Use the minimum appropriate intervention.

------------------------------------------------------------
SEED / PLANTING MATERIAL PROBLEM
------------------------------------------------------------

Consider Beejamrit.

Beejamrit is primarily a seed / planting-material treatment.

Do NOT automatically recommend it as a routine foliar pesticide.

------------------------------------------------------------
SOIL / ROOT-ZONE / FERTILITY PROBLEM
------------------------------------------------------------

Consider:

Jeevamrit
Ghanjeevamrit

Use them for appropriate soil, root-zone and plant-support
situations.

Do NOT automatically call Jeevamrit or Ghanjeevamrit a fungicide.

------------------------------------------------------------
FUNGAL / DISEASE PROBLEM
------------------------------------------------------------

Consider:

Sour Buttermilk
Sonthastra

Select only when the diagnosis supports them.

Do NOT automatically recommend insect-control preparations for
a fungal disease.

------------------------------------------------------------
SUCKING PESTS
------------------------------------------------------------

For appropriate aphids, whiteflies, jassids and similar sucking
pests, consider:

Neemastra

------------------------------------------------------------
CATERPILLARS / BORERS
------------------------------------------------------------

For appropriate caterpillar or borer problems, consider:

Agniastra

------------------------------------------------------------
OTHER APPROPRIATE INSECT PRESSURE
------------------------------------------------------------

For suitable pest situations, consider:

Brahmastra
Dashparni Ark

Do NOT recommend them merely because they are available.

============================================================
8. PREPARATION ACCURACY RULE
============================================================

Every selected Natural Farming input must have a practical
preparation procedure.

The preparation must clearly explain:

1. Ingredients
2. Quantity
3. Mixing order
4. Heating/boiling if applicable
5. Fermentation/maturation if applicable
6. Cooling if applicable
7. Filtering if applicable
8. Final preparation
9. Application method

NEVER replace a known preparation with:

"follow local guidance"

when validated preparation information is available.

NEVER invent:

- ingredients
- quantities
- fermentation periods
- boiling periods
- dilution rates
- acre rates
- spray volumes
- drip rates

============================================================
9. BEEJAMRIT
============================================================

Use only for seed or planting-material treatment.

Validated formulation:

For approximately 100 kg seed:

- 5 kg fresh cow dung
- 5 L cow urine
- 50 g lime
- 1 kg healthy bund soil
- 20 L water

Preparation:

1. Place fresh cow dung in a clean cloth.
2. Tie the cloth securely.
3. Place/suspend it in the water according to the validated
   preparation method.
4. Prepare lime water separately.
5. Squeeze the cow-dung bundle into the water.
6. Add healthy bund soil.
7. Add cow urine.
8. Add the prepared lime water.
9. Mix thoroughly.

Use only for seed or planting-material treatment unless
validated crop guidance specifically supports another use.

============================================================
10. JEEVAMRIT
============================================================

Use primarily for soil/root-zone biological support.

Validated formulation for approximately 200 L:

- 10 kg fresh cow dung
- 5–10 L cow urine
- 2 kg jaggery
- 2 kg pulse flour
- 1 kg healthy/uncontaminated soil
- 50 g lime
- 200 L water

Preparation:

1. Take a clean drum.
2. Add water.
3. Add cow dung.
4. Add cow urine.
5. Add jaggery.
6. Add pulse flour.
7. Add healthy soil.
8. Add lime.
9. Mix thoroughly.
10. Keep in shade.
11. Follow the validated fermentation procedure.
12. Stir according to the validated Natural Farming protocol.

Do NOT invent a fermentation duration if it is not available in
the validated information.

Do NOT call Jeevamrit a fungicide unless specific validated crop
guidance supports that claim.

============================================================
11. GHANJEEVAMRIT
============================================================

Use only when soil/root-zone/fertility management is relevant.

Do NOT use it as a routine foliar pesticide.

Do NOT invent a preparation formula if validated formulation
information is not available.

If exact preparation information is unavailable, clearly state
that the exact preparation is not specified in the validated
Natural Farming information available.

============================================================
12. SOUR BUTTERMILK / KHATTI LASSI
============================================================

Use only for appropriate Natural Farming disease-management
situations.

Do NOT describe it as a universal fungicide.

Use properly fermented sour buttermilk according to validated
Natural Farming guidance.

Do NOT invent:

- fermentation period
- additives
- copper
- turmeric
- chemicals
- unsupported ingredients

If a validated rate is available, use that exact rate.

Example of a documented rate:

3 L sour buttermilk + 100 L water.

Mathematical equivalent:

30 ml sour buttermilk per 1 L water.

IMPORTANT:

The 30 ml/L value is only a mathematical conversion of the
validated 3 L/100 L formulation.

Do NOT present a general rate as a tomato-specific rate unless
tomato-specific validation exists.

============================================================
13. SONTHASTRA / SONTHASTAR
============================================================

Sonthastra is an established Natural Farming preparation.

Do NOT describe it as a new Snap-Heal invention.

Use one validated formulation consistently.

Controlled formulation:

- 200 g dry ginger powder
- 2 L water
- 2 L milk without cream

Preparation:

1. Take 200 g dry ginger powder.
2. Add 2 L water.
3. Boil the ginger preparation.
4. Reduce approximately by half.
5. Allow it to cool.
6. Take 2 L milk.
7. Heat/boil slowly according to the validated procedure.
8. Allow it to cool.
9. Remove the cream.
10. Combine the ginger extract and cream-removed milk.
11. Add to the validated final spray-water volume.
12. Mix thoroughly.
13. Keep covered according to the validated procedure.
14. Filter before spraying.
15. Use within the validated application period.

IMPORTANT:

Do NOT combine this formulation with another Sonthastra
formulation.

Do NOT invent:

- extra milk
- extra ginger
- additional ingredients
- additional fermentation
- unsupported dilution
- unsupported acre dosage

If a crop-specific rate is unavailable, clearly say so.

============================================================
14. NEEMASTRA
============================================================

Use only for suitable insect-pest problems.

Validated formulation:

For approximately 200 L:

- 200 L water
- 10 L cow urine
- 2 kg cow dung
- 10 kg fine neem-leaf paste
  OR validated neem-seed-pulp equivalent

Preparation:

1. Take a clean drum.
2. Add water.
3. Add cow urine.
4. Add cow dung.
5. Add neem-leaf paste or validated neem-seed-pulp equivalent.
6. Mix thoroughly.
7. Keep in shade.
8. Follow the validated preparation process.
9. Filter before application.

Do NOT recommend Neemastra for a fungal disease when no insect
pest is present.

============================================================
15. AGNIASTRA
============================================================

Use only for appropriate insect pests such as suitable
caterpillars and borers.

Use only a validated formulation.

Do NOT recommend it for:

- fungal disease
- bacterial disease
- viral disease
- nutrient deficiency
- water stress

If a tobacco-containing formulation is used, provide a safety
warning in the selected language.

============================================================
16. BRAHMASTRA
============================================================

Use only for suitable insect-pest situations.

Use only a validated formulation.

If datura-containing material is involved, provide a clear safety
warning in the selected language.

Do not ingest.

Keep away from children, food, drinking water and animals.

============================================================
17. DASHPARNI KWATH / DASHPARNI ARK
============================================================

Use only for appropriate insect-pest situations.

Do NOT invent:

- leaf species
- leaf quantities
- concentration
- fermentation period
- storage period
- application rate

If validated formulation information is unavailable, explicitly
state that the exact preparation is not specified in the
validated Natural Farming information available.

============================================================
18. EXACTLY THREE TREATMENTS
============================================================

Generate EXACTLY THREE treatments.

Never generate four or more.

The three treatments must form one logical sequence.

------------------------------------------------------------
TREATMENT 1
------------------------------------------------------------

Immediate correction / containment.

Choose the most appropriate immediate Natural Farming
intervention for the diagnosed problem.

------------------------------------------------------------
TREATMENT 2
------------------------------------------------------------

Follow-up / recovery.

Choose a validated follow-up treatment.

It may be:

- another appropriate approved input
- the same input again

ONLY when supported by validated guidance.

------------------------------------------------------------
TREATMENT 3
------------------------------------------------------------

Stabilization / prevention.

Focus on:

- plant recovery
- soil/root-zone support
- prevention
- cultural management
- appropriate Natural Farming practice

IMPORTANT:

Do not select a product simply to fill the third treatment.

If a third product is not justified, use an appropriate
Natural Farming cultural/physical practice instead.

============================================================
19. TREATMENT DETAIL FORMAT
============================================================

For EACH of the three treatments provide:

{T["treatment"]}

{T["purpose"]}

{T["natural_input"]}

{T["why_treatment"]}

{T["preparation"]}

{T["spray_dilution"]}

{T["per_litre"]}

{T["per_acre"]}

{T["drip_soil"]}

{T["application_method"]}

{T["spray_time"]}



{T["monitoring"]}

Every field must contain practical information or:

{T["not_required"]}

when genuinely not applicable.

============================================================
20. QUANTITY RULE
============================================================

Never confuse:

- preparation quantity
- spray dilution
- per-litre quantity
- per-acre quantity
- total spray volume
- drip quantity
- soil application quantity
- seed-treatment quantity

Example:

If a preparation is made using 200 L water, do NOT automatically
state that 200 L is the crop's per-acre spray requirement.

Preparation quantity and application quantity are different.

============================================================
21. DOSAGE SAFETY RULE
============================================================

NEVER invent a dosage.

NEVER invent a per-litre rate.

NEVER invent a per-acre rate.

NEVER invent a spray volume.

NEVER invent a drip rate.

NEVER invent a concentration.

NEVER invent a spray interval.

If the exact validated value is unavailable, say in the selected
language that the exact application rate is not specified in the
validated Natural Farming guidance available.

============================================================
22. APPLICATION TIMING
============================================================

For foliar spraying, consider:

- crop stage
- temperature
- sunlight
- wind
- humidity
- rainfall
- crop condition

Prefer suitable low-stress periods such as early morning or
late afternoon/evening.

Avoid:

- strong sunlight
- extreme heat
- strong wind
- imminent heavy rainfall

Never say "spray anytime".

============================================================
23. DRIP / SOIL APPLICATION
============================================================

Recommend drip or soil application ONLY when appropriate to the
selected input and validated guidance.

Consider:

- crop stage
- irrigation system
- soil moisture
- root-zone condition
- weather

Never convert a foliar recommendation into a drip
recommendation without evidence.

============================================================
24. MONITORING
============================================================

After every treatment, tell the farmer what to monitor.

Monitor relevant indicators such as:

- disease spread
- disease severity
- new healthy growth
- pest population
- leaf condition
- plant vigor
- root-zone condition

Never guarantee complete cure.

If symptoms worsen, recommend reassessment and appropriate local
agricultural/KVK guidance.

============================================================
25. SAFETY
============================================================

If the selected preparation contains potentially toxic material,
include a clear safety warning.

Examples:

- tobacco
- datura
- concentrated botanical preparations

The warning MUST be written entirely in:

{selected_language}

============================================================
26. NO UNRELATED INPUTS
============================================================

Do NOT recommend a pest-control preparation when the evidence
supports only a fungal disease.

Do NOT recommend a fungicide when the evidence supports only an
insect problem.

Do NOT recommend soil inputs merely because they are available.

Every treatment must have a clear reason connected to the
diagnosis.

============================================================
27. NO CHEMICAL INPUTS
============================================================

Do not automatically recommend:

- NPK
- urea
- DAP
- MOP
- synthetic fertilizer
- synthetic fungicide
- synthetic pesticide
- synthetic plant-growth regulator

The treatment plan must remain within the approved ZBNF /
Natural Farming library and appropriate Natural Farming
cultural practices.

============================================================
28. NO IMAGE GENERATION
============================================================

Do NOT generate images.

Do NOT generate image prompts.

Do NOT output:

IMAGE_PROMPT

[[SYMPTOM_IMAGE]]

[[TREATMENT_1_IMAGE]]

[[TREATMENT_2_IMAGE]]

[[TREATMENT_3_IMAGE]]

============================================================
29. FINAL OUTPUT — EXACTLY FOUR SECTIONS
============================================================

The final answer MUST contain exactly four top-level sections.

SECTION 3:

## {T["section_3"]}

SECTION 4:

## {T["section_4"]}

SECTION 5:

## {T["section_5"]}

SECTION 6:

## {T["section_6"]}

Do NOT create any other top-level section.

Do NOT add an introduction.

Do NOT add a conclusion.

Do NOT add general advice outside these sections.

============================================================
30. SECTION 3 — DIAGNOSIS
============================================================

Use the localized labels:

### {T["most_likely"]}

Provide the most likely problem.

### {T["confidence"]}

Choose:

{T["high"]}

{T["moderate"]}

or

{T["low"]}

### {T["why"]}

Give 2–5 evidence-based reasons.

### {T["alternatives"]}

Give only relevant alternative possibilities.

============================================================
31. SECTION 4 — SYMPTOMS
============================================================

Use:

### {T["image_symptoms"]}

List ONLY symptoms actually visible in the images.

### {T["farmer_symptoms"]}

List ONLY symptoms reported by the farmer.

### {T["check_symptoms"]}

List symptoms that still need field inspection.

Do not mix these three categories.

============================================================
32. SECTION 5 — THREE TREATMENTS
============================================================

Create exactly THREE treatments.

Treatment 1:
Immediate correction / containment.

Treatment 2:
Follow-up / recovery.

Treatment 3:
Stabilization / prevention.

For every treatment use ONLY the localized labels:

### {T["treatment"]} 1

### {T["purpose"]}

### {T["natural_input"]}

### {T["why_treatment"]}

### {T["preparation"]}

### {T["spray_dilution"]}

### {T["per_litre"]}

### {T["per_acre"]}

### {T["drip_soil"]}

### {T["application_method"]}

### {T["spray_time"]}



### {T["monitoring"]}

Repeat the same structure for treatments 2 and 3.

============================================================
33. SECTION 6 — SUMMARY TABLE
============================================================

Create exactly ONE table.

The table must contain exactly THREE rows.

The table headers must be written entirely in the selected
language.

Use the localized equivalents of:

Treatment
Purpose
Natural Input / Practice
Preparation
Per 1 Litre
Per 1 Acre
Application Method
Spray Time
Drip / Soil Application
Monitoring

Do NOT use English headers when Telugu or Hindi is selected.

Do NOT add extra columns.

============================================================
34. FINAL LANGUAGE VALIDATION
============================================================

Before returning the answer, perform an internal language check.

Check:

1. Every visible word is in the selected language.
2. Every heading is localized.
3. Every subheading is localized.
4. Every table header is localized.
5. Every treatment description is localized.
6. Every preparation instruction is localized.
7. Every warning is localized.
8. No accidental English sentences remain.
9. No accidental Telugu remains when English is selected.
10. No accidental Hindi remains when English or Telugu is selected.
11. No bilingual brackets exist.
12. No mixed-language table exists.

If any language mixing exists:

REWRITE THE RESPONSE BEFORE RETURNING IT.

============================================================
35. FINAL AGRICULTURAL VALIDATION
============================================================

Before returning the answer verify:

- Diagnosis is evidence-based.
- Image symptoms are genuinely visible.
- Farmer symptoms are kept separate.
- Exactly three treatments exist.
- Treatment 1 is immediate correction/containment.
- Treatment 2 is follow-up/recovery.
- Treatment 3 is stabilization/prevention.
- Only approved Natural Farming inputs are selected.
- Products match the diagnosed problem.
- No unrelated pesticide is recommended.
- No preparation is invented.
- No ingredient is invented.
- No dosage is invented.
- No acre quantity is invented.
- No fermentation period is invented.
- No crop-specific claim is invented without support.
- Preparation quantity is not confused with application quantity.
- Foliar treatment is not incorrectly converted into drip treatment.
- No chemical input is automatically recommended.
- No image-generation instruction is produced.

============================================================
36. FINAL OUTPUT RULE
============================================================

Return ONLY the four requested sections.

Do not write anything before SECTION 3.

Do not write anything after SECTION 6.

Do not repeat the crop information already displayed by the
website.

Do not repeat uploaded photographs.

Do not repeat the farmer-reported problem outside the appropriate
symptom section.

Do not create a fourth treatment.

Do not create image prompts.

Do not create image markers.

The final response language MUST be:

{selected_language}
"""
 
    logger = logging.getLogger(__name__)
    PRIMARY_MODEL = "gemini-3.6-flash"
    FALLBACK_MODEL = "gemini-3.5-flash-lite"    
    def is_retryable_gemini_error(error):
        error_text = str(error).upper()

        retryable_errors = [
            "503",
            "UNAVAILABLE",
            "500",
            "INTERNAL",
            "429",
            "RESOURCE_EXHAUSTED",
            "408",
            "TIMEOUT",
        ]

        return any(code in error_text for code in retryable_errors)


    def get_retry_delay(attempt):
        base_delay = min(2 ** attempt * 2,20)

        jitter = random.uniform(0.5,2.0)

        return base_delay + jitter

    # STREAM GEMINI RESPONSE
    def generate_stream():

        full_result = ""

        try:
            contents = [prompt]

            for image_field in crop_images:

                if not image_field:
                    continue

                try:

                    image_field.open("rb")

                    image_bytes = image_field.read()

                    mime_type, _ = mimetypes.guess_type(image_field.name)

                    if ( not mime_type or not mime_type.startswith("image/")):
                        mime_type = "image/jpeg"

                    logger.info("Sending crop image: %s | bytes=%s | mime=%s",image_field.name,len(image_bytes),mime_type)

                    contents.append(types.Part.from_bytes(data=image_bytes,mime_type=mime_type))

                    image_field.close()

                except Exception as image_error:

                    logger.exception("Image error: %s",image_error)
                    try:
                        image_field.close()
                    except Exception:
                        pass

            config = types.GenerateContentConfig(

                automatic_function_calling=(types.AutomaticFunctionCallingConfig(disable=True)))
            models = [PRIMARY_MODEL,FALLBACK_MODEL]

            last_error = None

            for model in models:

                logger.info("Trying Gemini model: %s",model)

                model_success = False
                for attempt in range(3):

                    try:

                        logger.info("Gemini attempt %s/3 | model=%s",attempt + 1,model)
                       
                        response = client.models.generate_content_stream(model=model,contents=contents,config=config)

                        temp_result = ""


                        for chunk in response:

                            text = getattr(chunk,"text","")

                            if not text:
                                continue

                            temp_result += text

                        if not temp_result.strip():

                            raise RuntimeError("Gemini returned an empty response.")
                    # SUCCESS

                        full_result = temp_result

                        model_success = True

                        logger.info("Gemini success | model=%s | chars=%s",model,len(full_result))

                        break

                    except Exception as error:

                        last_error = error

                        logger.warning("Gemini error | model=%s | attempt=%s | error=%s",model,attempt + 1,error)

                        if not is_retryable_gemini_error(error):

                            raise


                        if attempt == 2:

                            logger.warning("All retries exhausted for model=%s",model)

                            break
                        delay = get_retry_delay(
                            attempt
                        )

                        logger.info("Waiting %.2f seconds before retry",delay)

                        time.sleep(delay)

                if model_success:
                    break

            if not full_result.strip():

                raise last_error or RuntimeError("Gemini AI generation failed.")


            chunk_size = 1200


            for start in range(0,len(full_result),chunk_size):
   

                text_chunk = full_result[start:start + chunk_size]
                

                yield (json.dumps({"type": "text","content": text_chunk},ensure_ascii=False)+ "\n")

            result_html = markdown.markdown(full_result,extensions=["extra","tables","sane_lists"])
    
            request.session["result_html"] = result_html

            request.session.modified = True

            yield (json.dumps({"type": "complete"})+ "\n")
 
        except Exception as error:

            logger.exception("Crop AI generation failed")

            error_text = str(error).upper()
            if ( "503" in error_text or "UNAVAILABLE" in error_text):

                message = ("Gemini AI is temporarily busy. Please wait a few seconds and try again.")

            elif ("429" in error_text or "RESOURCE_EXHAUSTED" in error_text):

                message = ("Gemini request limit reached. Please try again shortly.")

            else:
                message = ("AI analysis failed.Please try again.")
            yield (
                json.dumps({"type": "error","message": message},ensure_ascii=False)+ "\n")
    # STREAMING RESPONSE
    response = StreamingHttpResponse(generate_stream(),content_type="application/x-ndjson")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response
