<script lang="ts">
    import { browser } from '$app/environment';
        import type { LatLng, LatLngBounds } from 'leaflet';
// import { latLng } from 'leaflet';
    import { onMount } from 'svelte';

    
    
    
    export let data; 

    const {addresses}  = data


    onMount(async ()=>{
        if (browser){
            const L = await import('leaflet')
            let map = L.map('map').setView([51.505, -0.09], 13);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 11,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            const layergroup = L.layerGroup()

            let bound: LatLngBounds | null = null
            addresses?.forEach(d=>{
                const m = L.marker([d.position.lat, d.position.lng])
                if (!bound){
                    const latlng = m.getLatLng()
                    bound = L.latLngBounds([latlng]) 
                } else {
                    bound.extend(m.getLatLng())
                }
                layergroup.addLayer(m)
            })
            layergroup.addTo(map)
            if (bound){
                map.flyToBounds(bound)
            }
        }
    })

</script>


<form action="/" class='searchbar' data-sveltekit-reload>
    <input type="text" name='place' placeholder="placeToSearch" id='inputplace'>
</form>
{#if data.place}
<div>
    place: {data.place}
</div>
<div>
    {#if addresses}
    {#each  addresses as a,i}
            <p>
                {a.title} - {a.address.label} - latlong ({a.position.lat},{a.position.lng})
            </p>
        {/each }
    {/if}
</div>
{/if}
<div class='main'>
    <div id='map'></div>
</div>


<style>
    .searchbar {
        height: fit-content;
    }
    #inputplace {
        height: 50px;
        width: 100%;
    }
    #map {
        height: 100%;
    }
    .main {
        height: 50vh;
        /* width: 50vw; */
        display: block;
        /* position: fixed; */
        /* border: 9px solid red; */
    }
</style>