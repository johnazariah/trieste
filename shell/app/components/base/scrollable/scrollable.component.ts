import {
    AfterViewInit,
    Component,
    DoCheck,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    Output,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";

// import * as SimpleBar from "simplebar";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "bex-scrollable",
    template: require("./scrollable.html"),
})
export class ScrollableComponent implements DoCheck, OnDestroy, AfterViewInit {
    public dragOffset = { x: 0, y: 0 };

    /**
     * If the content is long enough to need a scrollbar
     */
    public isScrollbarNeeded = true;

    /**
     * If the scrollbar should be displayed
     */
    public scrollbarVisible = false;

    /**
     * If we are currently dragging the scrollbar
     */
    public dragging = false;

    /**
     * Margin at which the scrolledToBottom will be triggered.
     * If 0 the content needs to be scroll all the way to the bottom 
     * otherwise at x pixel from the bottom it will start triggering.
     */
    @Input()
    public scrollMargin: number = 0;

    @Output()
    public scrollBottom = new EventEmitter<number>();

    @ViewChild("scrollable")
    public scrollable;

    @ViewChild("trackY")
    public trackY;

    @ViewChild("scrollbarY")
    public scrollbarY;

    @ViewChild("scrollContent")
    public scrollContent;

    @ViewChild("content")
    public simpleBarContent;

    private width: number;
    private height: number;

    private contentWidth: number;
    private contentHeight: number;
    private flashTimeout: any;

    constructor(private elementRef: ElementRef) { }

    public ngAfterViewInit() {
        this.resizeScrollContent();
        this.resizeScrollbar();

        this.drag = this.drag.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.endDrag = this.endDrag.bind(this);
    }

    @HostListener("scroll")
    public onScroll() {
        this.flashScrollbar();

        if (this.scrolledToBottom()) {
            this.scrollBottom.emit(this.scrollTop());
        }
    }

    public ngDoCheck() {
        // Check the content or container size has not changed
        if (this.scrollable && this.simpleBarContent) {
            const width = this.elementRef.nativeElement.offsetWidth;
            const height = this.currentHeight();

            const contentWidth = this.elementRef.nativeElement.children[0].offsetWidth;
            const contentHeight = this.currentContentHeight();

            const containerChanged = width !== this.width || height !== this.height;
            const contentChanged = contentWidth !== this.contentWidth || contentHeight !== this.contentHeight;

            if (containerChanged || contentChanged) {
                this.width = width;
                this.height = height;

                this.contentWidth = contentWidth;
                this.contentHeight = contentHeight;

                this.update();
            }
        }
    }

    public update() {
        this.resizeScrollContent();
        this.resizeScrollbar();
    }

    public scrollTo(position: number) {
        this.elementRef.nativeElement.scrollTop = position;
        this.update();
    }

    public ngOnDestroy() {
        // this.bar.unMount();
    }

    /**
     * Resize content element
     */
    public resizeScrollContent() {
        this.scrollContent.nativeElement.style.width = `${this.scrollable.nativeElement.offsetWidth}px`;
        this.scrollContent.nativeElement.style.height = `${this.scrollable.nativeElement.offsetHeight}px`;
    }

    /**
     * Resize scrollbar
     */
    public resizeScrollbar() {
        let track;
        let scrollbar;

        track = this.trackY.nativeElement;
        scrollbar = this.scrollbarY.nativeElement;

        let contentSize = this.scrollContent.nativeElement.scrollHeight;
        let scrollOffset = this.scrollContent.nativeElement.scrollTop;
        let scrollbarSize = track.offsetHeight;
        let scrollbarRatio = scrollbarSize / contentSize;
        // Calculate new height/position of drag handle.
        // Offset of 2px allows for a small top/bottom or left/right margin around handle.
        let handleOffset = Math.round(scrollbarRatio * scrollOffset) + 2;
        let handleSize = Math.floor(scrollbarRatio * (scrollbarSize - 2)) - 2;

        // Set isVisible to false if scrollbar is not necessary (content is shorter than wrapper)
        this.isScrollbarNeeded = scrollbarSize < contentSize;

        if (this.isScrollbarNeeded) {
            track.style.visibility = "visible";
            scrollbar.style.top = `${handleOffset}px`;
            scrollbar.style.height = `${handleSize}px`;
        } else {
            track.style.visibility = "hidden";
        }
    }

    /**
     * Flash scrollbar visibility
     */
    public flashScrollbar() {
        this.resizeScrollbar();
        this.showScrollbar();
    }

    /**
     * Show scrollbar
     */
    public showScrollbar() {
        if (!this.isScrollbarNeeded) {
            return;
        }

        this.scrollbarVisible = true;

        if (this.flashTimeout) {
            window.clearTimeout(this.flashTimeout);
        }

        this.flashTimeout = window.setTimeout(this.hideScrollbar.bind(this), 1000);
    }

    /**
     * Hide Scrollbar
     */
    public hideScrollbar() {
        this.scrollbarVisible = false;

        if (this.flashTimeout) {
            window.clearTimeout(this.flashTimeout);
        }
    }

    /**
     * Start scrollbar handle drag
     */
    public startDrag(e) {
        // Preventing the event's default action stops text being
        // selectable during the drag.
        e.preventDefault();
        this.dragging = true;
        let scrollbar = this.scrollbarY.nativeElement;
        // Measure how far the user's mouse is from the top of the scrollbar drag handle.
        let eventOffset = e.pageY;

        this.dragOffset["y"] = eventOffset - scrollbar.getBoundingClientRect().top;

        document.addEventListener("mousemove", this.drag);
        document.addEventListener("mouseup", this.endDrag);
    }

    /**
     * Drag scrollbar handle
     */
    public drag(e) {
        e.preventDefault();

        let eventOffset = e.pageY;
        let track = this.trackY.nativeElement;

        // Calculate how far the user's mouse is from the top/left of the scrollbar (minus the dragOffset).
        let dragPos = eventOffset - track.getBoundingClientRect().top - this.dragOffset["y"];
        // Convert the mouse position into a percentage of the scrollbar height/width.
        let dragPerc = dragPos / track.offsetHeight;

        // Scroll the content by the same percentage.
        let scrollPos = dragPerc * this.scrollContent.nativeElement.scrollHeight;

        this.scrollContent.nativeElement.scrollTop = scrollPos;
    }

    /**
     * End scroll handle drag
     */
    public endDrag() {
        this.dragging = false;
        document.removeEventListener("mousemove", this.drag);
        document.removeEventListener("mouseup", this.endDrag);
    }

    private scrollTop(): number {
        return this.scrollContent.nativeElement.scrollTop;
    }

    private currentHeight(): number {
        return this.elementRef.nativeElement.offsetHeight;
    }

    private currentContentHeight(): number {
        return this.simpleBarContent.nativeElement.offsetHeight;
    }

    private scrolledToBottom(): boolean {
        const scrollTop = this.scrollTop();
        const height = this.currentHeight();
        const contentHeight = this.currentContentHeight();
        return height + scrollTop + this.scrollMargin >= contentHeight;
    }
}
