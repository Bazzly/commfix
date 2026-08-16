'use client'

import dynamic from 'next/dynamic'

const SingleMarkerMap = dynamic(() => import('./SingleMarkerMap'), { ssr: false })

export default SingleMarkerMap
