import { useState, useEffect, useCallback } from "react";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { useLocation } from "./useLocation";

const useNearbyData = <T,>(params: Record<string, any>, useDataMutation: any, totalPagesKey: string, dataKey: string) => {
    const [pageNo, setPageNo] = useState(1);
    const [dataList, setDataList] = useState<T[]>([]);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [getData, { isLoading }] = useDataMutation();
    const location = useLocation();
    const fetchData = useCallback(async () => {
        try {
            const response = await getData({
                ...params,
                longitude: location?.longitude,
                latitude: location?.latitude,
                page_no: pageNo
            }).unwrap();
            setDataList((prev) => [...prev, ...response[dataKey]]);
            if (pageNo >= response[totalPagesKey]) {
                setHasMorePages(false);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [params, pageNo, getData, totalPagesKey, location?.latitude, location?.longitude]);

    useEffect(() => {
        console.log(location)
        if (location != null) fetchData();
    }, [fetchData, location?.latitude, location?.longitude]);

    const lastElementRef = useInfiniteScroll(() => {
        if (hasMorePages && !isLoading) {
            setPageNo((prev) => prev + 1);
        }
    }, isLoading);

    return { dataList, isLoading, lastElementRef, setDataList, setPageNo, setHasMorePages };
};

export default useNearbyData;
