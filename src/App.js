import './App.css';
import Navigation from './component/Navigation/Navigation';
import Logo from './component/Logo/Logo';
import ImageLinkForm from './component/ImageLinkFrom/ImageLinkForm';
import Rank from './component/Rank/Rank';
import Signin from './component/Signin/Signin';
import Register from './component/Register/Register';
import FaceRecognition from './component/FaceRecognition/FaceRecognition';
import ParticlesBg from 'particles-bg';
import React, {Component} from 'react';

 const setupClarifai = (imageUrl) => {
  const PAT = 'afe0c60a58bc49608550ea567e7929ba';

  const USER_ID = 'wladka99';       
  const APP_ID = 'face-detect';
  const IMAGE_URL = imageUrl;
  const raw = JSON.stringify({
    "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
    },
    "inputs": [
        {
            "data": {
                "image": {
                    "url": IMAGE_URL
                }
            }
        }
    ]
});
const requestOptions = {
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Authorization': 'Key ' + PAT
  },
  body: raw
};

return requestOptions
 }

const initialState = {
    imageUrl: '',
    input: "",
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: "",
      name: "",
      email: "",
      entries: 0,
      joined: ""

    }
  }

class App extends Component {
  constructor() {
    super();
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }
    })
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch("https://api.clarifai.com/v2/models/face-detection/outputs", setupClarifai(this.state.input))
    .then(response => response.json())
    .then(response => {this.displayFaceBox(this.calculateFaceLocation(response))
      if(response){
        fetch("http://localhost:3000/image", {
          method: "put",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
             id: this.state.user.id
        })
      })
      .then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, { entries: count }))
      })
      .catch(console.log)
    }
    })
    .catch(error => console.log(error))
  }

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState(initialState)
    } else if(route === 'home'){
      this.setState({isSignedIn: true})
    } 
  this.setState({route: route});
  }

  render(){
   const {isSignedIn, imageUrl, route, box} = this.state;
  return (
    <div className="App">
      <ParticlesBg type="cobweb" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
      { route === 'home' ?
        <div>
        <Logo />
        <Rank name={this.state.user.name} 
              entries={this.state.user.entries} 
        />
        <ImageLinkForm onInputChange={this.onInputChange} 
                      onButtonSubmit={this.onButtonSubmit}/>
        <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
        : (
          route === 'signin' ?
        <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        :
        <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        )
      } 
      
    </div>
  );
}
}

export default App;