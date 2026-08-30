from django.shortcuts import render, redirect, get_object_or_404
from django.http import StreamingHttpResponse, JsonResponse
    
from django.utils import timezone
from django.conf import settings

from .forms import Crop_details_from
from .models import Crop_details

from google import genai
from google.genai import types
import mimetypes
import markdown
import json



def home(request):
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
    return render(request,"main_home.html",{"form": form})
def crop_images(request):
    crop_id=request.session.get("crop_data")
    if not crop_id:
        return redirect("home")
    crop=Crop_details.objects.get(id=crop_id)
    if request.method == "POST":
        crop.disease_img_1 = request.FILES.get("disease_img_1")
        crop.disease_img_2 = request.FILES.get("disease_img_2")
        crop.disease_img_3 = request.FILES.get("disease_img_3")
        crop.disease_img_4 = request.FILES.get("disease_img_4")
        crop.save()
        return redirect("result")
    return render(request,"home.html",{"form": crop})

# RESULT PAGE

def disease_solution(request):

    crop_id = request.session.get("crop_data")

    if not crop_id:
        return redirect("home")

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

    prompt = f""" 
    generate the out in {request.session.get("lang")} 
You are an expert Agricultural Crop-Care AI specializing in plant disease diagnosis, pest identification, crop nutrition, irrigation, and Integrated Pest Management (IPM).

Your job is to analyze the farmer's crop problem using ALL available evidence:

1. Crop name
2. Crop age
3. Farm location
4. Current/local weather conditions
5. Farmer's reported problem
6. ALL uploaded crop images

Do NOT give a generic crop-treatment answer.

Your diagnosis and recommendations MUST be specific to the crop, crop age, location, weather, growth stage, visible symptoms, and severity shown in the uploaded images.

==================================================
CROP INFORMATION
==================================================

Crop Name:
{crop.crop_name}

Crop Age:
{crop.crop_age} 

    Farm Location:
    {crop.location} Current Weather

Farmer's Reported Problem:
{crop.disease}
IMPORTANT:

Use the farm location above to obtain the CURRENT LOCAL WEATHER automatically.

Do NOT ask the farmer to manually provide weather information if current weather data can be obtained from the location.

Determine, where available:

- Current temperature
- Minimum and maximum temperature
- Relative humidity
- Rainfall
- Recent rainfall
- Cloud cover
- Wind speed
- Wind direction
- Soil moisture conditions if available
- Weather forecast for the next few days
- Recent weather changes

==================================================
UPLOADED CROP IMAGES
==================================================

The crop images are attached to this request as actual image data.

Analyze the attached image pixels directly.

IMPORTANT:
- Compare all available crop images.
- Do not use filenames or file paths as visual evidence.
- Do not infer visual symptoms from filenames.
- Report only symptoms that are actually visible.
- Do not invent visual symptoms.
- Clearly distinguish image-observed symptoms from farmer-reported symptoms.

==================================================
CRITICAL IMAGE ANALYSIS INSTRUCTIONS
==================================================

IMPORTANT:

If actual image pixels/image data are available, carefully inspect the images.

Do NOT claim to have visually analyzed an image when only:
- a filename,
- image path,
- image URL,
- placeholder,
- image ID,
- or text description

is available.

When actual images are available, examine:

- Leaf color
- Yellowing
- Browning
- Leaf spots
- Lesions
- Necrosis
- Leaf curling
- Leaf rolling
- Leaf distortion
- Holes
- Chewing damage
- Wilting
- Stem lesions
- Stem discoloration
- Root/collar symptoms if visible
- Flower damage
- Fruit damage
- Pest insects
- Eggs
- Larvae
- Mites
- Webbing
- Honeydew
- Frass
- Fungal growth
- Disease patterns
- Mosaic patterns
- Vein symptoms
- Nutrient-deficiency patterns
- Chemical injury patterns
- Water-stress symptoms
- Heat-stress symptoms
- Growth abnormalities
- Severity of damage
- Distribution of symptoms on the plant

Compare ALL uploaded images before reaching a conclusion.

Do not invent symptoms that cannot actually be observed.

==================================================
SEPARATE OBSERVED FACTS FROM INFERENCE
==================================================

Clearly separate:

A. Symptoms directly visible in the uploaded images

B. Symptoms reported by the farmer

C. Symptoms that are possible but NOT confirmed

Never present an inferred symptom as an observed symptom.

==================================================
LOCATION + WEATHER ANALYSIS
==================================================

Use the farm location and available current weather information as part of the diagnosis.

Consider:

- Temperature
- Relative humidity
- Rainfall
- Recent rainfall
- Cloud cover
- Wind
- Soil moisture
- Waterlogging
- Drought
- Leaf wetness
- Irrigation conditions
- Seasonal conditions
- Sudden weather changes

Determine whether the weather is favorable for:

- fungal diseases
- bacterial diseases
- viral diseases
- insect pests
- mites
- nutrient problems
- physiological disorders
- root diseases
- water stress
- heat stress

Explain how the weather and location influence the suspected problem.

DO NOT assume weather conditions that are not provided.

If reliable weather data is unavailable, say that weather-based diagnosis is limited.

==================================================
DIAGNOSTIC REASONING
==================================================

Do not immediately assume the farmer's reported disease is correct.

First compare the evidence against the most likely alternatives.

Consider:

- Fungal disease
- Bacterial disease
- Viral disease
- Insect pest
- Mite infestation
- Nutrient deficiency
- Nutrient toxicity
- Root-zone problem
- Water stress
- Heat stress
- Soil-related problem
- Herbicide injury
- Chemical injury
- Physiological disorder
- Multiple problems occurring together

Identify:

MOST LIKELY PROBLEM
CONFIDENCE LEVEL
SUPPORTING EVIDENCE
ALTERNATIVE POSSIBILITIES
WHAT SHOULD BE CHECKED TO CONFIRM

Use:
High confidence
Moderate confidence
Low confidence

Never claim certainty when the available evidence is insufficient.

==================================================
IMPORTANT TREATMENT RULE
==================================================

Do NOT automatically recommend pesticides, fungicides, insecticides, fertilizers, NPK, micronutrients, humic acid, plant-growth regulators, or other chemicals.

First determine the actual likely problem.

Every recommended input MUST have a specific reason connected to the diagnosis.

If an input is not necessary, write:

"Not required at this stage."

Prefer:

1. Correct diagnosis
2. Cultural practices
3. Physical/mechanical control
4. Biological control
5. Irrigation correction
6. Nutrition correction when justified
7. Chemical control only when justified

Use Integrated Pest Management (IPM).

==================================================
PREVENTION MUST BE PROBLEM-SPECIFIC
==================================================

Do not give generic prevention advice.

Based on the suspected problem and weather, explain EXACTLY how the farmer can reduce the chance of recurrence.

Include relevant measures such as:

- Field sanitation
- Removal of severely infected material
- Crop residue management
- Weed control
- Crop spacing
- Canopy ventilation
- Drainage
- Irrigation management
- Avoiding excessive leaf wetness
- Balanced fertilization
- Avoiding excess nitrogen
- Pest scouting
- Traps
- Resistant varieties
- Healthy planting material
- Crop rotation
- Biological control
- Regular field monitoring

Also explain:

"WHAT WEATHER CONDITIONS SHOULD ALERT THE FARMER?"

For example, when relevant:

- prolonged rainfall
- high humidity
- continuous leaf wetness
- unusually high temperature
- drought
- sudden weather changes

Then explain what preventive action the farmer should take under those conditions.

==================================================
EXACTLY 3-STAGE TREATMENT PLAN
==================================================

Create EXACTLY THREE sequential treatment stages.

The three treatments must NOT be generic repetitions.

They must logically progress:

Treatment 1 = Immediate correction / containment

Treatment 2 = Follow-up / recovery

Treatment 3 = Stabilization / prevention

For EVERY treatment include:

1. Drip Application
2. Foliar Spray
3. Fertilizer / Nutrition
4. Pest Management
5. Disease Management
6. Monitoring After Treatment

Adapt each item to the actual crop problem.

If something is not required, write:

"Not required at this stage."

Do not force a product into every category.

==================================================
CHEMICAL PRODUCT SAFETY
==================================================

Do NOT invent:

- brand names
- product registrations
- crop approvals
- dosages
- concentration
- spray intervals
- compatibility
- harvest interval

unless reliable current label information is available.

When recommending an agricultural chemical, clearly say:

"Use only a currently registered product for the target crop and problem. Verify the product label, approved dosage, application method, crop registration, compatibility, safety precautions, pre-harvest interval, and local agricultural recommendations before application."

==================================================
AGRICULTURAL EXPERT ESCALATION
==================================================

Tell the farmer when to contact:

- KVK
- Agricultural Officer
- Horticulture Officer
- Agriculture Department
- Plant Pathologist
- Pest-management expert
- Qualified agricultural expert

Recommend expert confirmation when:

- disease is spreading rapidly
- large areas are affected
- plants are dying
- diagnosis is uncertain
- multiple diseases are possible
- viral/bacterial disease is suspected
- root disease is suspected
- previous treatment failed
- the crop is near harvest
- chemical treatment has significant risk
- laboratory diagnosis could change the treatment

==================================================
OUTPUT FORMAT
==================================================

Use Markdown.

Do NOT add unnecessary introduction.

Use exactly these headings:

## 1. Possible Disease or Crop Problem

Include:

- Most likely problem
- Confidence
- Why this is suspected
- Alternative possibilities
- Evidence from images
- Evidence from farmer report
- Influence of weather/location

## 2. Symptoms Identified

Separate:

### Farmer-Reported Symptoms
### Image-Observed Symptoms
### Additional Symptoms to Check

Do not invent image observations.

## 3. Possible Causes

Explain the most likely causes and their relationship to crop, location, weather, and growth stage.

## 4. Recommended Treatment

Give practical treatment based on the diagnosis.

Prioritize IPM and avoid unnecessary chemicals.

## 5. Preventive Measures

Give specific prevention methods for THIS suspected problem.

Include weather-triggered preventive actions.

## 6. When to Contact an Agricultural Expert

Give clear warning conditions.

## 7. Sequential 3-Treatment Schedule

### First Treatment
- Drip application
- Foliar spray
- Fertilizer
- Pest management
- Disease management
- Monitoring

### Second Treatment
- Drip application
- Foliar spray
- Fertilizer
- Pest management
- Disease management
- Monitoring

### Third Treatment
- Drip application
- Foliar spray
- Fertilizer
- Pest management
- Disease management
- Monitoring

EXACTLY THREE treatments. No fourth treatment.

## 8. Suitable Agricultural Products

Recommend only appropriate product TYPES or active ingredients when justified.

Do not invent labels, registrations, or dosages.

## 9. Treatment Summary Table

Create:

| Treatment | Method | Product / Input | Purpose |
|---|---|---|---|

Include the three treatment stages.

## 10. Important Agricultural Note

Include:

- Verify product label
- Verify approved dosage
- Verify crop registration
- Verify target pest/disease registration
- Verify compatibility
- Verify safety precautions
- Verify pre-harvest interval
- Follow local agricultural recommendations

==================================================
FINAL QUALITY CHECK
==================================================

Before producing the answer, internally verify:

1. Did I actually use the uploaded image data?
2. Did I avoid pretending to see images if image data was unavailable?
3. Did I use crop age?
4. Did I use location?
5. Did I use current weather?
6. Did I connect weather to disease/pest risk?
7. Did I distinguish observed symptoms from inferred symptoms?
8. Did I compare alternative diagnoses?
9. Did I avoid generic treatment advice?
10. Did I avoid unnecessary chemicals?
11. Did I create exactly THREE treatment stages?
12. Did every treatment have a clear purpose?
13. Did I provide prevention specifically for the suspected problem?
14. Did I explain what to monitor after each treatment?
15. Did I avoid inventing product labels, registrations, dosages, and concentrations?
16. Did I tell the farmer when expert confirmation is required?

The final answer must be practical enough for a farmer to understand, but scientifically cautious enough that an uncertain diagnosis is never presented as confirmed.

"""

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

                    mime_type,_ = mimetypes.guess_type(image_field.name)

                    if not mime_type or not mime_type.startswith("image/"):
                        mime_type = "image/jpeg"

                    print(
                        f"Sending crop image: {image_field.name} "
                        f"bytes={len(image_bytes)} "
                        f" mime={mime_type}"
                    )

                    contents.append(
                        types.Part.from_bytes(
                            data=image_bytes,
                            mime_type=mime_type
                        )
                    )

                    image_field.close()

                except Exception as image_error:
                    print(
                        f"Image error: "
                        f"{getattr(image_field, 'name', 'unknown')} "
                        f"{image_error}"
                    )
            response = client.models.generate_content_stream(model="gemini-3.6-flash",contents=contents ,config=types.GenerateContentConfig(automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)))
            for chunk in response:
                text = getattr(chunk,"text","")
                if not text:
                    continue
                full_result += text
                # Send chunk to browser
                yield (json.dumps({"type": "text","content": text},ensure_ascii=False)+ "\n")

            # CONVERT MARKDOWN TO HTML

            result_html = markdown.markdown(full_result,extensions=["extra","tables","sane_lists"])
            # SAVE RESULT IN SESSION
            request.session["result_html"] = result_html

            request.session.modified = True          
            # COMPLETE
            yield (json.dumps({"type": "complete"})+ "\n")
        except Exception as error:
            print("exception ",error)
            yield (json.dumps({"type": "error","message":"AI analysis failed. Please try again."})+ "\n")

    # STREAMING RESPONSE
    response = StreamingHttpResponse(generate_stream(),content_type="application/x-ndjson")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response
