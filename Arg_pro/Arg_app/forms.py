from django import forms
from . models import Crop_details
from . models import Crop_advice
class Crop_details_from(forms.ModelForm):
    class Meta:
        model=Crop_details
        fields="__all__"
class Crop_advice_from(forms.ModelForm):
    class Meta:
        model=Crop_advice
        fields="__all__"
    