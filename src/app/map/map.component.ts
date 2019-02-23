import { Component, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";

import {} from "googlemaps";

@Component({
  selector: "map-component",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})
export class MapComponent implements OnInit {
  @ViewChild("gmap") gmapElement: any;
  public map: google.maps.Map;
  public infowindow = new google.maps.InfoWindow({
    content: "test"
  });
  public marker: any;
  public service: any;
  public geocoder: any;
  public searchString: string;

  constructor() {}

  ngOnInit(): void {
    var position = new google.maps.LatLng(29, -83);
    var mapProp = {
      center: position,
      zoom: 4,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    this.marker = new google.maps.Marker({
      position: position,
      map: this.map,
      title: "Test"
    });
    this.service = new google.maps.places.PlacesService(this.map);
    this.geocoder = new google.maps.Geocoder();

    google.maps.event.addListener(this.map, "click", event => {
      this.handleMapClick(event);
    });
  }

  search() {
    console.log(this.searchString);
    this.infowindow.close();
    var request = {
      query: this.searchString,
      fields: ["name", "geometry", "photos"]
    };
    this.service.findPlaceFromQuery(request, (places, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log(places);
        this.marker.setPosition(places[0].geometry.location);
        if (places && places[0] && places[0].photos && places[0].photos[0]) {
          this.infowindow.setContent(
            "<img src='" +
              places[0].photos[0].getUrl() +
              "' width='150px;' height='150px;' />"
          );
        } else {
          this.infowindow.setContent("<p>Image Unavailable</p>");
        }
        setTimeout(() => {
          this.infowindow.open(this.map, this.marker);
        }, 200);
      } else {
        console.log(status);
      }
    });
    this.searchString = null;
  }

  handleMapClick(event) {
    this.infowindow.close();
    console.log("clicked map", event.latLng);
    this.marker.setPosition(event.latLng);
    this.geocoder.geocode({ location: event.latLng }, results => {
      let addr = results[0].formatted_address;
      let city = addr.slice(addr.indexOf(",") + 1);
      console.log(city);
      var request = {
        query: "city" + city,
        fields: ["name", "geometry", "photos"]
      };
      this.service.findPlaceFromQuery(request, (places, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log(places);
          //   this.marker.setPosition(places[0].geometry.location);
          if (places && places[0] && places[0].photos && places[0].photos[0]) {
            this.infowindow.setContent(
              "<img src='" +
                places[0].photos[0].getUrl() +
                "' width='150px;' height='150px;' />"
            );
          } else {
            this.infowindow.setContent("<p>Image Unavailable</p>");
          }
          setTimeout(() => {
            this.infowindow.open(this.map, this.marker);
          }, 200);
        } else {
          console.log(status);
        }
      });
    });
    // this.infowindow.open(this.map, this.marker);
  }
}
