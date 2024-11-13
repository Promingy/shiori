from django.db import models

# Create your models here.
class Profile(models.Model):
    user        = models.OneToOneField("app.Model", on_delete=models.CASCADE)
    first_name  = models.CharField(max_length=100)
    last_name   = models.CharField(max_length=100)
    email       = models.CharField(max_length=100)
    is_activated   = models.BooleanField(default=False)


# class Book(models.Model):
#     title            = models.CharField(max_length=100)
#     author           = models.CharField(max_length=100)
#     publication_date = models.DateField()


class Decks(models.Model):
    profile     = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="decks")
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    
class Notes(models.Model):
    profile     = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="notes")
    guid        = models.CharField(max_length=100, null=False, blank=False)
    model_id    = models.IntegerField(null=False, blank=False)
    modified    = models.IntegerField(null=False, blank=False)
    fields      = models.TextField()
    tags        = models.TextField(blank=True, null=True)

class Cards(models.Model):
    profile     = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="cards")
    note        = models.ForeignKey(Notes, on_delete=models.CASCADE, related_name="cards")
    deck        = models.ForeignKey(Decks, on_delete=models.CASCADE, related_name="cards")
    order       = models.IntegerField()
    type        = models.IntegerField()
    queue       = models.IntegerField()
    due         = models.IntegerField()

class Media(models.model):
    filename    = models.CharField(max_length=100)
    filetype    = models.CharField(max_length=50)
    file_url    = models.CharField(max_length=255)