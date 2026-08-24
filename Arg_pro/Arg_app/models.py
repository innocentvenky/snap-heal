from django.db import models

# Create your models here.
class Crop_details(models.Model):
    crop_name=models.CharField(max_length=30)
    crop_age=models.IntegerField()
    location=models.CharField(max_length=500)
    disease_img_1=models.ImageField(upload_to="crop_images/",blank=True,null=True)
    disease_img_2=models.ImageField(upload_to="crop_images/",blank=True,null=True)
    disease_img_3=models.ImageField(upload_to="crop_images/",blank=True,null=True)
    disease_img_4=models.ImageField(upload_to="crop_images/",blank=True,null=True)
    disease=models.TextField(default=None,blank=True)
    def __str__(self):
        return self.crop_name