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
  public showModal: boolean;
  public modalTitle: string;
  public imgData: any;

  constructor() {}

  ngOnInit(): void {
    this.showModal = false;
    this.imgData = {
      imgSrc: ""
    };
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

    // this.marker.addListener("mouseover", () => {
    //   console.log("rolled over marker");
    // });
  }

  search() {
    this.infowindow.close();
    var request = {
      query: this.searchString,
      fields: ["name", "geometry", "photos"]
    };
    this.service.findPlaceFromQuery(request, (places, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        var flightPlanCoordinates = [
          this.marker.position,
          places[0].geometry.location
        ];
        var flightPath = new google.maps.Polyline({
          path: flightPlanCoordinates,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        flightPath.setMap(this.map);
        this.marker.setPosition(places[0].geometry.location);
        if (places && places[0] && places[0].photos && places[0].photos[0]) {
          this.infowindow.setContent(
            "<label>" +
              this.searchString +
              "</label><br /><img id='thumbnail' src='" +
              places[0].photos[0].getUrl() +
              "' width='150px;' height='150px;' />"
          );
        } else {
          this.infowindow.setContent("<p>Image Unavailable</p>");
        }
        setTimeout(() => {
          this.infowindow.open(this.map, this.marker);
          this.searchString = null;
        }, 200);
      } else {
        console.log(status);
        this.searchString = null;
      }
    });
  }

  handleMapClick(event) {
    this.infowindow.close();
    var flightPlanCoordinates = [this.marker.position, event.latLng];
    var flightPath = new google.maps.Polyline({
      path: flightPlanCoordinates,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    flightPath.setMap(this.map);

    this.marker.setPosition(event.latLng);
    this.geocoder.geocode({ location: event.latLng }, results => {
      let addr = results[0].formatted_address;
      let city = addr.slice(addr.indexOf(",") + 1);
      var request = {
        query: "city" + city,
        fields: ["name", "geometry", "photos"]
      };
      this.service.findPlaceFromQuery(request, (places, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          //   this.marker.setPosition(places[0].geometry.location);
          if (places && places[0] && places[0].photos && places[0].photos[0]) {
            this.imgData.imgSrc = places[0].photos[0].getUrl();
            this.infowindow.setContent(
              "<label>" +
                city +
                "</label><br/><img id='thumbnail' src='" +
                this.imgData.imgSrc +
                "' width='150px;' height='150px;' />"
            );
            console.log(this.imgData);
            this.modalTitle = city;
          } else {
            this.infowindow.setContent("<p>Image Unavailable</p>");
          }
          setTimeout(() => {
            this.infowindow.open(this.map, this.marker);
            if (document.getElementById("thumbnail")) {
              document
                .getElementById("thumbnail")
                .addEventListener("mouseenter", event => {
                  this.showModal = true;
                  console.log("in");
                });
              document
                .getElementById("thumbnail")
                .addEventListener("mouseleave", event => {
                  //   this.showModal = false;
                  console.log("out");
                });
            }
          }, 200);
        } else {
          console.log(status);
        }
      });
    });
  }
}
