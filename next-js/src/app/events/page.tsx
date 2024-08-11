import Image from "next/image"
import Card from "./eventCard";
import { event } from "./eventCard";

let rae :event = {
  flyer: 'https://cdn.sanity.io/images/fnvy29id/tgs/fa90fe6315a7b25776d1a718b2ec2c5c0880135d-1125x1406.jpg',
  slug: 'https://www.eventbrite.com/e/rae-khalil-crybaby-album-release-event-public-records-tickets-978470691177?utm-campaign=social&utm-content=attendeeshare&utm-medium=discovery&utm-term=listing&utm-source=cp&aff=ebdsshcopyurl'
}
let meow = 'https://google.com';

export default function Page(){
    return (<div>
      <h1 className="bg-orange-500">Events Home</h1>
          <div className=" grid grid-flow-row-dense grid-cols-4 gap-2">

        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/fa90fe6315a7b25776d1a718b2ec2c5c0880135d-1125x1406.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/9c0e3a4c693eafa091cdac9cea10db5f6c2c37fd-1080x1350.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/57d74eea376fa502e0c1acf40c8bc570a0738035-1418x1418.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/28cb6f969774dbec3865973c3c89cfb4c2faa7db-1600x1600.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/a09469015f7f67dcb9ef8b6ab638c45bfcf95c87-2542x2546.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/c7a9a2b522967b7fa3c198f90729704fac2a698e-2200x2742.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/fa90fe6315a7b25776d1a718b2ec2c5c0880135d-1125x1406.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/9c0e3a4c693eafa091cdac9cea10db5f6c2c37fd-1080x1350.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/57d74eea376fa502e0c1acf40c8bc570a0738035-1418x1418.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/28cb6f969774dbec3865973c3c89cfb4c2faa7db-1600x1600.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/a09469015f7f67dcb9ef8b6ab638c45bfcf95c87-2542x2546.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/c7a9a2b522967b7fa3c198f90729704fac2a698e-2200x2742.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/fa90fe6315a7b25776d1a718b2ec2c5c0880135d-1125x1406.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/9c0e3a4c693eafa091cdac9cea10db5f6c2c37fd-1080x1350.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/57d74eea376fa502e0c1acf40c8bc570a0738035-1418x1418.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/28cb6f969774dbec3865973c3c89cfb4c2faa7db-1600x1600.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/a09469015f7f67dcb9ef8b6ab638c45bfcf95c87-2542x2546.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/c7a9a2b522967b7fa3c198f90729704fac2a698e-2200x2742.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/fa90fe6315a7b25776d1a718b2ec2c5c0880135d-1125x1406.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/9c0e3a4c693eafa091cdac9cea10db5f6c2c37fd-1080x1350.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/57d74eea376fa502e0c1acf40c8bc570a0738035-1418x1418.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/28cb6f969774dbec3865973c3c89cfb4c2faa7db-1600x1600.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/a09469015f7f67dcb9ef8b6ab638c45bfcf95c87-2542x2546.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/c7a9a2b522967b7fa3c198f90729704fac2a698e-2200x2742.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/9c0e3a4c693eafa091cdac9cea10db5f6c2c37fd-1080x1350.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/57d74eea376fa502e0c1acf40c8bc570a0738035-1418x1418.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/28cb6f969774dbec3865973c3c89cfb4c2faa7db-1600x1600.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/a09469015f7f67dcb9ef8b6ab638c45bfcf95c87-2542x2546.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/c7a9a2b522967b7fa3c198f90729704fac2a698e-2200x2742.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/fa90fe6315a7b25776d1a718b2ec2c5c0880135d-1125x1406.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/9c0e3a4c693eafa091cdac9cea10db5f6c2c37fd-1080x1350.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/57d74eea376fa502e0c1acf40c8bc570a0738035-1418x1418.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/28cb6f969774dbec3865973c3c89cfb4c2faa7db-1600x1600.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/a09469015f7f67dcb9ef8b6ab638c45bfcf95c87-2542x2546.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/9c0e3a4c693eafa091cdac9cea10db5f6c2c37fd-1080x1350.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/57d74eea376fa502e0c1acf40c8bc570a0738035-1418x1418.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/28cb6f969774dbec3865973c3c89cfb4c2faa7db-1600x1600.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/a09469015f7f67dcb9ef8b6ab638c45bfcf95c87-2542x2546.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/c7a9a2b522967b7fa3c198f90729704fac2a698e-2200x2742.png" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/fa90fe6315a7b25776d1a718b2ec2c5c0880135d-1125x1406.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/9c0e3a4c693eafa091cdac9cea10db5f6c2c37fd-1080x1350.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/57d74eea376fa502e0c1acf40c8bc570a0738035-1418x1418.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/28cb6f969774dbec3865973c3c89cfb4c2faa7db-1600x1600.jpg" />
        <Card slug = {meow} flyer="https://cdn.sanity.io/images/fnvy29id/tgs/a09469015f7f67dcb9ef8b6ab638c45bfcf95c87-2542x2546.png" />
        </div><div className=" grid grid-flow-col-dense gap-2">
    </div></div>
  )
} 

