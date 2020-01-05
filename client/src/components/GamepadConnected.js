import React from 'react';

const GamepadConnected = props => {

    return (
        <div className="badge mt-3 text-left" style={{ height: 35 }}>
            <span style={{ fontSize: "small" }}><i className="fas fa-gamepad fa-fw fa-2x text-white border" /> {props.connected ? "Connected" : "Not Connected"}</span> 
        </div>
    );
};

export default GamepadConnected;
