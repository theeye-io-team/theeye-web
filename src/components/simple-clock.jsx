import React, { Component } from 'react'
// import ReactDOM from 'react-dom'

class Clock extends Component {
  constructor (props) {
    super(props)
    this.state = {date: new Date()}
  }

  componentDidMount () {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    )
  }

  componentWillUnmount () {
    clearInterval(this.timerID)
  }

  tick () {
    this.setState({
      date: new Date()
    })
  }

  render () {
    const containerStyle = {
      display: 'inline-block'
    }
    const customStyle = {
      fontWeight: 'bold'
    }
    return (
      <div style={containerStyle}>
        <span style={customStyle}>{this.state.date.toLocaleTimeString()}</span>
      </div>
    )
  }
}

module.exports = Clock
