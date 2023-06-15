import { YOUR_API_KEY } from "$env/static/private"
import type { ResultType } from "./resultType"

export async function load(request){
    const {url} = request

    const place = url.searchParams.get('place')
    if (!place)return {place: ''}
    const queryurl = `https://geocode.search.hereapi.com/v1/geocode?q=${place}&apiKey=${YOUR_API_KEY}`
    const response = await fetch(queryurl)
    const HERE: ResultType= <ResultType> await response.json()

    const [minX,minY, maxX,maxY] = [-7.68,49.75,2.85,58.99]


    const addresses = HERE.items.filter(d=>{
        return ((d.position.lat < maxY) &&
        (d.position.lng < maxX) &&
        (d.position.lat > minY) &&
        (d.position.lng > minX))

    })

    if (place) return {place:place, addresses:addresses}
    return {place: ''}
}