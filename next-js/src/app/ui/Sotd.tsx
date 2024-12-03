'use client'

function catchClick() {
    let audio = (document.getElementById('myAudio')) as HTMLAudioElement
    if (audio.paused) {
        
        audio.play()
    }
    else {
        
        audio.pause()
    }
}
export default function Sotd() {
    return (<div onClick={catchClick}>
        <div className="pt-3 md:pt-0 w-72 xl:w-72 md:ml-4 xl:flex-none rounded-xl inline-flex place-items-center align-center justify-around">
            <img src="https://cdn.sanity.io/images/fnvy29id/tgs/9d324ccb04867fdad82cf73515eb8f1461570d31-2010x516.png" alt="" />
            <audio loop id='myAudio' src="https://cdn.sanity.io/files/fnvy29id/tgs/16d2eea6de26ee3ab6aec3abc90492b2c3f7e854.mp3"></audio>
        </div>
    </div>)
}