from django import forms
from . models import Crop_details
class Crop_details_from(forms.ModelForm):
    class Meta:
        model=Crop_details
        fields="__all__"
    