import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./InfoHint.module.scss";

const VIEWPORT_PADDING = 12;
const TOOLTIP_GAP = 8;
const MIN_TOOLTIP_HEIGHT = 80;
const MAX_TOOLTIP_HEIGHT = 320;
const EDGE_PADDING = 16; // demo build: an open tooltip stays this far from the screen's sides

const InfoHint = ({ text, ariaLabel = "Інформація" }) => {
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState("top");
    const [maxHeight, setMaxHeight] = useState(MAX_TOOLTIP_HEIGHT);
    const [shiftX, setShiftX] = useState(0);
    const shiftRef = useRef(0);

    const wrapRef = useRef(null);
    const tooltipRef = useRef(null);

    useEffect(() => {
        const onDocClick = (e) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target)) setOpen(false);
        };

        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    useEffect(() => {
        const onDocKeyDown = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("keydown", onDocKeyDown);
        return () => document.removeEventListener("keydown", onDocKeyDown);
    }, []);

    useLayoutEffect(() => {
        if (!open) shiftRef.current = 0; // a closed tooltip has no shift (its marginLeft is dropped)
        if (!open || !wrapRef.current || !tooltipRef.current) return;

        const updateTooltipPosition = () => {
            if (!wrapRef.current || !tooltipRef.current) return;

            const triggerRect = wrapRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            const spaceAbove = triggerRect.top - VIEWPORT_PADDING - TOOLTIP_GAP;
            const spaceBelow =
                window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING - TOOLTIP_GAP;

            const needHeight = Math.min(tooltipRect.height, MAX_TOOLTIP_HEIGHT);

            let nextPlacement = "bottom";

            if (spaceBelow >= needHeight) {
                nextPlacement = "bottom";
            } else if (spaceAbove >= needHeight) {
                nextPlacement = "top";
            } else {
                nextPlacement = spaceBelow >= spaceAbove ? "bottom" : "top";
            }

            const availableHeight =
                nextPlacement === "top" ? spaceAbove : spaceBelow;

            // demo build: keep the open tooltip inside the screen horizontally (it is centred on the icon on phones,
            // so near the right edge it was cut off); the shift is measured from the unshifted position
            const vw = document.documentElement.clientWidth;
            const left = tooltipRect.left - shiftRef.current;
            const right = tooltipRect.right - shiftRef.current;
            let nextShift = 0;
            if (right > vw - EDGE_PADDING) nextShift = vw - EDGE_PADDING - right;
            if (left + nextShift < EDGE_PADDING) nextShift = EDGE_PADDING - left;
            shiftRef.current = nextShift;
            setShiftX(nextShift);

            setPlacement(nextPlacement);
            setMaxHeight(
                Math.max(MIN_TOOLTIP_HEIGHT, Math.min(MAX_TOOLTIP_HEIGHT, availableHeight))
            );
        };

        updateTooltipPosition();

        window.addEventListener("resize", updateTooltipPosition);
        window.addEventListener("scroll", updateTooltipPosition, true);

        return () => {
            window.removeEventListener("resize", updateTooltipPosition);
            window.removeEventListener("scroll", updateTooltipPosition, true);
        };
    }, [open, text]);

    return (
        <span
            ref={wrapRef}
            className={styles.hint}
            data-open={open ? "true" : "false"}
            data-placement={placement}
        >
            <button
                type="button"
                className={styles.icon}
                aria-label={ariaLabel}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
            >
                i
            </button>

            <span
                ref={tooltipRef}
                className={styles.tooltip}
                role="tooltip"
                style={{ maxHeight: `${maxHeight}px`, marginLeft: open && shiftX ? `${shiftX}px` : undefined }}
                onClick={(e) => e.stopPropagation()}
            >
                {text}
            </span>
        </span>
    );
};

export default InfoHint;