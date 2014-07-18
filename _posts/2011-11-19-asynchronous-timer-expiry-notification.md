---
layout: post-no-feature
category : tip
tags : [c, epoll, select, timerfd]
tagline : or "how awesome timerfd and epoll really are"
---
In some recent TCP experiment that I carried in the user space, I faced the problem of generating relatively precise timer events in an asynchronous way. Furthermore, multiple timers had to be maintained simultaneously.

The `timerfd` mechanism in Linux (`man timerfd_create(2)`) allows one to create different types of timers that communicate expiry events through a file descriptor. The standard `read()`, `select()`, `poll()` functions can then be used to detect and process the expiration notifications. As for the clock granularity, with `CLOCK_REALTIME` and with High Resolution Timer (HRT) support, I get very respectable 1.000000e-09 seconds on my system. To see this, you can compile (using the `-lrt` flag) and run the following :

    #include
    #include
    #include

    int main(void)
    {
    printf("System Clock Granularity %ld\n", sysconf(_SC_CLK_TCK));

    struct timespec gran;
    if (clock_getres(CLOCK_MONOTONIC, &gran) < 0) {
        perror("clock_getres()");
        return -1;
    }
    printf("CLOCK_MONOTONIC granularity %ld %ld\n", gran.tv_sec, gran.tv_nsec);

    return 0;
    }

Both periodic and non-periodic timers can be created a timer obtained through timerfd_create(). This behavior is configurable via the itermerspec structure passed as an argument to the `timerfd_settime()` function:

    struct itimerspec timerSpec;
    memset(&timerSpec, 0, sizeof(timerSpec));

    timerSpec.it_value.tv_sec = sec;
    timerSpec.it_value.tv_nsec = nsec;

    timerSpec.it_interval.tv_sec = intsec;
    timerSpec.it_interval.tv_nsec = intnsec;

Whenever the it_value field has both its `tv_sec` and `tv_nsec` fields set to 0, the timer is effectively disarmed and no future timer expiry events should take place.

Once a timer has been set, `read()` will report the number of timer expirations events that have occurred since the last call.

## Epoll

Having the ability to generate timer events, wouldn't be nice if we could only register a callback function that would get call automatically from the outside to handle any processing that would have to be done ?

Linux provides the epoll functionality which appears much more elegant and easy to use that its traditional `select()` counterpart. Even better maybe, it is said to be O(1) versus O(n) : this claim is reported here then taken to Wikipedia and discussed on Stackoverflow.

One cool thing for sure is its ability to deliver event notifications on the set of file descriptors that it watches under either edge or level-triggered modes. In the first case, `epoll_wait()` (normally a blocking call that you would place in a mainloop) will return as long as there is remaining data on one of its file descriptor. By contrast, when one sets the `EPOLLONESHOT` flag, `epoll_wait()` will generate only one event after which the associated file descriptor will be disabled.
Cooking up the final solution

Before going any further : yes libevent exists and also uses epoll. The point here is not to use it.

Back to the initial goal of generating timer expiry notifications asynchronously via callbacks, we only have to register the file descriptor associated with our instantiated `timerfd` elements to epoll with `epoll_ctl()` and the `EPOLL_CTL_ADD` flag. Then run the `epoll_wait()` in a loop and you almost have a complete solution.

Two problems then remain : how do you keep track of which callback function (together with the arguments to pass) goes with a given timer, and finally how do you avoid blocking you application on `epoll_wait()` ? The latter can be easily solved by wrapping our mainloop in a thread (with the necessary thread-safety precautions): DONE. For the former, `epoll_ctl()` delights us with its `epoll_data_t` union member of the epoll_event structure.

    typedef union epoll_data {
        void        *ptr;
        int          fd;
        uint32_t     u32;
        uint64_t     u64;
    } epoll_data_t;

    struct epoll_event {
        uint32_t     events;      /* Epoll events */
        epoll_data_t data;        /* User data variable */
    };

`void *ptr` you said ? Yep that's it : here's our function pointer. Since epoll_data is a union, we will probably want to record more than one element under ptr. To do so, we can wrap all the information we need under a structure such as :

    typedef struct {
      int tfd;
      void (*timed_action_handler)(void*);
      void* arg;
    } timed_action_t;

Now when `epoll_wait()` unblocks we will be able to get access to the associated `epoll_event` and execute the callback passing its arg argument from the `timed_action_t` structure.

## GitHub

You can checkout a sketch of the approach explained above at <https://github.com/pierrelux/timedaction>
