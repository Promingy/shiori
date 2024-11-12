from django.db import models

# Create your models here.
class Profile(models.Model):
    first_name  = models.CharField(max_length=100)
    last_name   = models.CharField(max_length=100)


class Book(models.Model):
    title            = models.CharField(max_length=100)
    author           = models.CharField(max_length=100)
    publication_date = models.DateField()
    
