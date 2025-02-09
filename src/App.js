
import React, { Component } from 'react';
import Nav from './components/Nav';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import './App.css';

const API_HOST = 'https://opus-tm-api-server.herokuapp.com/';

let _csrfToken = null;

async function getCsrfToken() {
  if (_csrfToken === null) {
    const response = await fetch(`${API_HOST}/csrf/`, {
      credentials: 'include',
    });
    const data = await response.json();
    _csrfToken = data.csrfToken;
  }
  return _csrfToken;
}

async function testRequest(method) {
  const response = await fetch(`${API_HOST}/ping/`, {
    method: method,
    headers: (
      method === 'POST'
        ? {'X-CSRFToken': await getCsrfToken()}
        : {}
    ),
    credentials: 'include',
  });
  const data = await response.json();
  return data.result;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayed_form: '',
      logged_in: localStorage.getItem('token') ? true : false,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      picture: '',
      theme: ''
    };
  }

  componentDidMount() {
    if (this.state.logged_in) {
      fetch('https://opus-tm-api-server.herokuapp.com/main/current_user/', {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(json => {
          this.setState({ username: json.username });
        });
    }
  }

  handle_login = (e, data) => {
    e.preventDefault();
    fetch('https://opus-tm-api-server.herokuapp.com/token-auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(json => {
        console.log(json);
        localStorage.setItem('token', json.token);
        this.setState({
          logged_in: true,
          displayed_form: '',
          username: json.user.username,
          first_name: json.user.first_name
        });
      });
  };

  handle_signup = (e, data) => {
    e.preventDefault();
    fetch('https://opus-tm-api-server.herokuapp.com/main/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(json => {
        localStorage.setItem('token', json.token);
        this.setState({
          logged_in: true,
          displayed_form: '',
          username: json.username,
          first_name: json.first_name
        });
      });
  };

  handle_logout = () => {
    localStorage.removeItem('token');
    this.setState({ logged_in: false, username: '' });
  };

  display_form = form => {
    this.setState({
      displayed_form: form
    });
  };

  render() {
    let form;
    switch (this.state.displayed_form) {
      case 'login':
        form = <LoginForm handle_login={this.handle_login} />;
        break;
      case 'signup':
        form = <SignUpForm handle_signup={this.handle_signup} />;
        break;
      default:
        form = null;
    }

    return (
      <div className="App">
        <Nav
          logged_in={this.state.logged_in}
          display_form={this.display_form}
          handle_logout={this.handle_logout}
        />
        {form}
        <h3>
          {this.state.logged_in
            ? `Hello, ${this.state.username}. Your first name is ${this.state.first_name}.`
            : 'Please Log In'}
        </h3>
      </div>
    );
  }
}

export default App;