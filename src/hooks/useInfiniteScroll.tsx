import { useState, useCallback, useRef } from "react";

export const useInfiniteScroll = (callback: () => void, isLoading: boolean) => {
    const observer = useRef<IntersectionObserver | null>(null);

    const lastElementRef = useCallback(
        (node: HTMLElement) => {
            if (isLoading) return;

            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !isLoading) {
                    callback();
                }
            });

            if (node) observer.current.observe(node);
        },
        [callback, isLoading]
    );

    return lastElementRef;
};
