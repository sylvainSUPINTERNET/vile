import type { NextPage } from 'next'
import { useEffect , useRef} from 'react';
import { Profile } from '../types/Profile'

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

const Profiles = ({ profiles } : {profiles: Profile[] } ) => {
    let videoObject:any = useRef(null);

    useEffect( () => {
        getDevicesAndApplyStream(videoObject.current);
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