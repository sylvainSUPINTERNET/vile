import type { NextPage } from 'next'
import { useEffect , useRef, useState} from 'react';
import { Profile } from '../types/Profile';
import * as signalR from "@microsoft/signalr";
//import Peer from 'peerjs';

const getDevicesAndApplyStream = async (videoObject: any) => {
    const devices = await window.navigator
                            .mediaDevices
                            .enumerateDevices();
    

    try { 
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
    
        videoObject.srcObject = stream;
        videoObject.play();
    } catch ( e ) {
        console.log("Error : ", e);
    }

}

const peerInit = async () => {
    const peerjs = await import('peerjs');
    return new Promise( (resolve) => {
        resolve(peerjs.default);
    })
}

const peerInstance = async () => {
    const Peer:any = await peerInit();
    console.log(new Peer("sal"));
}


const Profiles = ({ profiles } : {profiles: Profile[] } ) => {
    let videoObject:any = useRef(null);
    // let [peer, setPeer]: any = useState(import('peerjs').then( async ({ default: Peer }) => {
    //     let p = await new Peer();
    //     return p;
    // } ));


    //import('peerjs').then( data => console.log(data));

    useEffect( () => {
        getDevicesAndApplyStream(videoObject.current);

        
        let connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:5001/profilehub")
            .build();

        connection.on("send", data => {
            console.log(data);
        });

        connection.start()
            .then(() => {
                console.log("SEND MESSAGE");
                connection.invoke("SendMessage", "Hello", "Sylvain")
            });

        peerInstance();

    })

    return (
        <div>

            <video ref={videoObject}>

            </video>
            {
                profiles.length > 0 && profiles.map( (profile:Profile, i:number) => {
                    return <div key={i}>
                        <div className="card">
                            {profile.name}
                            <button className="btn btn-primary">Ok</button>
                        </div>
                    </div>
                })
            }
            <p>Lets go : {profiles.length}</p>
        </div>
    )
}

export async function getStaticProps(context: any) {
    const profiles: Profile[] = [{
        name: "Sylvain",
        age: 10
    }, {
        name: "Neung",
        age: 10
    }];
    return {
        props: { profiles }
    }
}

export default Profiles;