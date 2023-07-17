<script lang="ts">
    import { browser } from '$app/environment';
    import { base } from '$app/paths';
        import type { LatLng, LatLngBounds, TileLayer } from 'leaflet';
// import { latLng } from 'leaflet';
    import { onMount } from 'svelte';
    import { each } from 'svelte/internal';

    
    
    
    export let data; 

    const {addresses}  = data

    
    let basemaps = <TileLayer[]>[]
    let basemapFunc: (index: number)=>void;

    onMount(async ()=>{
        if (browser){
            const L = await import('leaflet')


            // STEP 1 - initialise the map
            let map = L.map('map').setView([51.505, -0.09], 13);


            // STEP 2 - provide basemap options; openstreetmap, esri world topo map, and esri worldimagery
            let osmtiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 20,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            let Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 20,
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            });

            let Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            });
            
            basemaps =[...[osmtiles,Esri_WorldTopoMap,Esri_WorldImagery]] // using spread operator for Svelte reactivity

            // STEP 2.5 - add some functions to update the basemaps if the button is clicked
            basemapFunc = (index: number)=>{
                basemaps.forEach(p=>p.removeFrom(map))
                basemaps[index].addTo(map).bringToBack()
            }

            // STEP 3 - add some WMS layers
            const wmsLayer = L.tileLayer.wms('https://10.0.0.6/geoserver/wms', {
                format: 'image/png',
                transparent: true,
                layers: "ambersidegdb:power_lines_fme"
            }).addTo(map);

            

            // STEP 4 - SEARCH FUNCTIONS!!
            const layergroup = L.layerGroup()

            let bound: LatLngBounds | null = null
            let centr: LatLng = L.latLng(51.509865, -0.118092);
            let boundn = 0
            addresses?.forEach(d=>{
                const m = L.marker([d.position.lat, d.position.lng])
                if (!bound){
                    const latlng = m.getLatLng()
                    centr = latlng
                    bound = L.latLngBounds([latlng]) 
                    boundn+=1
                } else {
                    bound.extend(m.getLatLng())
                    boundn+=1
                }
                layergroup.addLayer(m)
            })
            console.log(boundn)
            console.log('ctr:',centr)
            layergroup.addTo(map)
            if (bound && (boundn>1)){
                boundn = 0
                console.log('mapbound:', bound)
                map.fitBounds(bound)
            } else if (centr) {
                console.log('panning to', centr)
                map.flyTo(centr)
                // centr = L.latLng(51.509865, -0.118092);
            } else {
                map.flyTo(centr)
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
<div>
    <!-- <button on:click={removewmsfunction}>removeWms</button> -->
</div>


{#each basemaps as b,i}
    <button on:click={()=>{basemapFunc(i)}}>basemap - {i}</button>
{/each}

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
        height: 70vh;
        /* width: 50vw; */
        display: block;
        /* position: fixed; */
        /* border: 9px solid red; */
    }
</style>