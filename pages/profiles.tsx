import type { NextPage } from 'next'
import { useEffect , useRef, useState} from 'react';
import { Profile } from '../types/Profile';
import * as signalR from "@microsoft/signalr";
import { nanoid } from 'nanoid'

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

const peerInstance = async (hubConnection: any) => {
    const Peer:any = await peerInit();
    let p = new Peer(nanoid())

    hubConnection.invoke("JoinLake", p._id);
    hubConnection.invoke("FindSomeone", p._id);

    return new Promise( resolve => resolve(p));

}


// https://stackoverflow.com/questions/58975883/prevent-rerender-for-every-setstate-using-react-usestate-hook

const Profiles = ({ profiles } : {profiles: Profile[] } ) => {
    let videoObject:any = useRef(null);
    let [hubConnection, setHubConnection] = useState({});

    let peerConnectionRef = useRef();

    useEffect( () => {

        getDevicesAndApplyStream(videoObject.current);

        let connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/profilehub").build();
        // @ts-ignore
        setHubConnection(connection);

        connection.on('newPeerOfferSend', ( targetPeerId:string ) => {
            console.log("NEW OFFER SEND WITH SUCCESS");
            console.log("TARGET PEER ID ", targetPeerId);

            //@ts-ignore
            let pConn = peerConnectionRef.current.connect(targetPeerId);
            pConn.on('data', (data:any) => {
                console.log("LIB", data);
            })


        });

        connection.on('newPeerOffer', async ( offerPeerId:string ) => {
            console.log("Received new offer");
            console.log("NEW OFFER RECEIVED, DO U ACCEPT ?", offerPeerId);

            console.log("NEW OFFER", peerConnectionRef);
            console.log(offerPeerId)

            //@ts-ignore
            let pConn = peerConnectionRef.current.connect(offerPeerId);
            pConn.on('open', () => {
                console.log("OPEN")
                pConn.send("HELLO");
            }) 


            

            //console.log(peerConnection);
            // const peerConn = Peer.connect(offerPeerId)
            // peerConn.on('open', () => {
            //     peerConn.send('hi!');
            //   });
        })
    }, []);


    const onClickStart = (ev:any) => {
        if ( hubConnection ) {
            //@ts-ignore
            hubConnection.start()
                .then( async () => {
                    let m = await peerInstance(hubConnection);

                    //@ts-ignore
                    peerConnectionRef.current = m;
                });
        }    
    }

    const onClickStop = (ev:any) => {
    }

    return (
        <div>

            <button onClick={ onClickStart }>Start</button>
            <button onClick={ onClickStop }>Stop</button>

            <video ref={videoObject}>

            </video>
            {/* {
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
             */}
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