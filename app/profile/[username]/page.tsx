import AlbumPageList from "@/components/AlbumPageList";
import AlbumPreview from "@/components/AlbumPreview";
import FollowButton from "@/components/FollowButton";
import NavBar from "@/components/NavBar";
import ProfileStat from "@/components/ProfileStat";
import SectionTitle from "@/components/SectionTitle";
import ViewAll from "@/components/ViewAll";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { createServerSupabaseClient } from '@/lib/supabase/server'

type ProfileProps = {
    params: {
        username: string
    }
}

export default async function Profile({ params }: ProfileProps) {

    const { username } =  await params

    return (
        <div className={`
            w-[1200px] h-fit
            mx-auto py-4
        `}>
            <NavBar />
            <div className={`
                profile-body
                w-[896px]
                mx-auto
                pb-18
            `}>
                <div className={`
                    profile-header
                    w-full
                    mt-16
                    flex justify-between items-start
                `}>
                    <div className={`
                        user-profile-info
                        flex justify-start items-center gap-4
                    `}>
                        <div className={`
                            user-avatar-container
                            w-24 h-24
                            rounded-full
                            bg-white
                        `}>
                            <UserCircleIcon width={96} height={96} className={`text-accentText`} />
                        </div>
                        <div className={`
                            user-info-container
                            w-96
                            flex flex-col items-start justify-center
                        `}>
                            <div className={`
                                flex justify-between items-center gap-8
                            `}>
                                <h1 className={`
                                    text-2xl
                                    line-clamp-1
                                `}>
                                    {/* <DisplayName /> */}
                                    Jordan Walker
                                </h1>
                                <FollowButton profile={username} />
                            </div>
                            <h2 className={`
                                username
                                text-secondaryText text-lg
                            `}>
                                @{username}
                            </h2>
                            <p className={`
                                user-bio
                                text-secondaryText text-sm
                                line-clamp-2
                            `}>
                                {/* Replace with data from users table bio column */}
                                Lorem ipsum dolor sit amet consectetur adipiscing elit. 
                                Quisque faucibus ex sapien vitae pellentesque sem placerat. 
                                In id cursus mi pretium tellus duis convallis. Tempus leo 
                                eu aenean sed diam urna tempor. Pulvinar vivamus fringilla 
                                lacus nec metus bibendum egestas. Iaculis massa nisl malesuada 
                                lacinia integer nunc posuere. Ut hendrerit semper vel class 
                                aptent taciti sociosqu. Ad litora torquent per conubia nostra 
                                inceptos himenaeos.
                            </p>
                        </div>
                    </div>
                    <div className={`
                        user-stats-container
                        flex justify-center items-center gap-8
                    `}>
                        <ProfileStat statName={'albums'} username={username} />
                        <ProfileStat statName={'followers'} username={username} />
                        <ProfileStat statName={'following'} username={username} />
                    </div>
                </div>
                <div className={`
                    main-container
                    w-[896px]
                    mx-auto mt-18
                    pb-18
                `}>
                    <section className={`
                        favorite-albums
                    `}>
                        <div className={`
                            favorite-albums-container
                        `}>
                            <div className={`
                                flex justify-between items-center
                            `}>
                                <SectionTitle title={'Favorite Albums'} />
                            </div>
                            {/* Component to feth favorite albums based on username */}
                            <div className={`
                                flex justify-center mt-4
                            `}>
                                <ul className={`
                                    grid-container
                                    mx-auto
                                    grid grid-cols-5 grid-rows-1 gap-5
                                `}>
                                    <AlbumPreview id="#" coverHeight={160} name="NEVER ENOUGH" artist="Turnstile" imageUrl="/images/album-covers/test-album-cover.png" />
                                    <AlbumPreview id="#" coverHeight={160} name="NEVER ENOUGH" artist="Turnstile" imageUrl="/images/album-covers/test-album-cover.png" />
                                    <AlbumPreview id="#" coverHeight={160} name="NEVER ENOUGH" artist="Turnstile" imageUrl="/images/album-covers/test-album-cover.png" />
                                    <AlbumPreview id="#" coverHeight={160} name="NEVER ENOUGH" artist="Turnstile" imageUrl="/images/album-covers/test-album-cover.png" />
                                    <AlbumPreview id="#" coverHeight={160} name="NEVER ENOUGH" artist="Turnstile" imageUrl="/images/album-covers/test-album-cover.png" />
                                </ul>
                            </div>
                        </div>
                    </section>
                    <section className={`
                        recently-listened
                        mt-16
                    `}>
                        <div className={`
                            favorite-albums-container
                        `}>
                            <div className={`
                                flex justify-between items-center
                            `}>
                                <SectionTitle title={'Recently Listened'} />
                                <ViewAll />
                            </div>
                            {/* Component to feth favorite albums based on username */}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}