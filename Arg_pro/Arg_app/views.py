from django.shortcuts import render, redirect, get_object_or_404
from django.http import StreamingHttpResponse, JsonResponse
    
from django.utils import timezone
from django.conf import settings

from .forms import Crop_details_from
from .models import Crop_details

from google import genai
import markdown
import json



def home(request):

    if request.method == "POST":

        form = Crop_details_from(request.POST,request.FILES)
        if form.is_valid():
            Crop_details.objects.all().delete()
            crop = form.save()
            request.session["crop_data"] = str(crop.id)

            return redirect("result")
    else:
        form = Crop_details_from()
    return render(request,"home.html",{"form": form})

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
    image_1 = str(crop.disease_img_1) if crop.disease_img_1 else "No image"
    image_2 = str(crop.disease_img_2) if crop.disease_img_2 else "No image"
    image_3 = str(crop.disease_img_3) if crop.disease_img_3 else "No image"
    image_4 = str(crop.disease_img_4) if crop.disease_img_4 else "No image"

    # GEMINI PROMPT

    prompt = f"""

You are an agricultural crop-care assistant.

Analyze the farmer's crop problem carefully.

CROP INFORMATION
----------------

Crop Name:
{crop.crop_name}

Crop Age:
{crop.crop_age} days

Location:
{crop.location}

Reported Crop Problem:
{crop.disease}


CROP IMAGES
-----------

Image 1:
{image_1}

Image 2:
{image_2}

Image 3:
{image_3}

Image 4:
{image_4}


IMPORTANT:
The image file names above are provided as reference information.
Do not claim that you visually diagnosed an image unless image data
is actually available to you.


GENERATE THE FOLLOWING SECTIONS:

## 1. Possible Disease or Crop Problem

Identify the most likely crop problem based on the available
information.

Clearly mention that this is a suspected diagnosis where appropriate.


## 2. Symptoms Identified

List the symptoms related to the farmer's reported problem.


## 3. Possible Causes

Explain the possible causes.


## 4. Recommended Treatment

Provide practical treatment recommendations.


## 5. Preventive Measures

Provide practical prevention methods.


## 6. When to Contact an Agricultural Expert

Clearly explain when the farmer should contact a KVK,
agricultural officer, or qualified agricultural expert.


## 7. Sequential 3-Treatment Schedule

Create exactly three treatments.

### First Treatment

Include:

- Drip application
- Foliar spray
- Fertilizer
- Pest management
- Disease management


### Second Treatment

Include:

- Drip application
- Foliar spray
- Fertilizer
- Pest management
- Disease management


### Third Treatment

Include:

- Drip application
- Foliar spray
- Fertilizer
- Pest management
- Disease management


## 8. Suitable Agricultural Products

Suggest suitable products where appropriate.

Do not invent product labels, registrations, or dosages.

Mention that product labels and local agricultural recommendations
must be checked before application.


## 9. Treatment Summary Table

Create a Markdown table with:

| Treatment | Method | Product / Input | Purpose |

Include the three treatment stages.


## 10. Important Agricultural Note

Add a short safety note telling the farmer to verify:

- Product label
- Dosage
- Crop registration
- Compatibility
- Harvest interval
- Local agricultural recommendations


IMPORTANT FORMATTING RULES:

- Use Markdown.
- Do not repeat sections.
- Keep the advice practical.
- Keep paragraphs reasonably short.
- Use headings.
- Use bullet points.
- Use tables where useful.
- Do not generate unnecessary introductory text.
- Adapt recommendations according to crop, crop age, location,
  and reported problem.

"""

    # STREAM GEMINI RESPONSE
    def generate_stream():

        full_result = ""
        try:
            response = client.models.generate_content_stream(model="gemini-3.6-flash",contents=prompt)
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
            yield (json.dumps({"type": "error","message":"AI analysis failed. Please try again."})+ "\n")

    # STREAMING RESPONSE
    response = StreamingHttpResponse(generate_stream(),content_type="application/x-ndjson")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response