from django.db import models

# Create your models here.
class Crop_details(models.Model):
    crop_name=models.CharField(max_length=30)
    crop_age=models.CharField(max_length=50)
    location=models.CharField(max_length=500)
    disease_img_1=models.ImageField(upload_to="crop_images/",blank=True,null=True)
    disease_img_2=models.ImageField(upload_to="crop_images/",blank=True,null=True)
    disease_img_3=models.ImageField(upload_to="crop_images/",blank=True,null=True)
    disease_img_4=models.ImageField(upload_to="crop_images/",blank=True,null=True)
    disease=models.TextField(default=None,blank=True)
    def __str__(self):
        return self.crop_name

class Crop_advice(models.Model):
    soil_type=models.CharField(max_length=50)
    soil_ph=models.CharField(max_length=50)
    organic_carbon=models.CharField(max_length=50)
    location=models.CharField(max_length=500)
    pincode=models.CharField(max_length=10)
    Fram_area=models.CharField(max_length=50)
    irragation_type=models.CharField(max_length=50)
    water_scource=models.CharField(max_length=50)
    planting_date=models.CharField(max_length=50)
    pervious_crop=models.CharField(max_length=50)
    Desired_Crop=models.CharField(max_length=50)
    def __str__(self):
        return self.Desired_Crop