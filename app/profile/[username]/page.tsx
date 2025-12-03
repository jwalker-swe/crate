import AlbumPageList from "@/components/AlbumPageList";
import AlbumPreview from "@/components/AlbumPreview";
import FollowButton from "@/components/FollowButton";
import NavBar from "@/components/NavBar";
import ProfileStat from "@/components/ProfileStat";
import SectionTitle from "@/components/SectionTitle";
import ViewAll from "@/components/ViewAll";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { createClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase/supabase";
import RecentlyListened from "@/components/RecentlyListened";
// import { createServerSupabaseClient } from '@/lib/supabase/server'

type ProfileProps = {
    params: Promise<{
        username: string
    }>
}

export default async function Profile({ params }: ProfileProps) {

	const supabase = await createClient();

    const { username } =  await params
    const { data: { user }, error } = await supabase.auth.getUser()

	async function checkIfFollowing(userId: string, username: string) {
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.eq('username', username)
			.single()

		if (error) {
			console.error('Error determining if following: ', username);
			return false;
		}
		if (!data) {
			console.log('Not following user: ', username);
			return false;
		}
		if (data) {
			console.log('Already following user: ', username);
			return true;
		}
	}

	const following = user?.id ? checkIfFollowing(user.id, username) : Promise.resolve(false);

    return (
        <div className={`
            w-full max-w-[1200px] h-fit
            mx-auto py-4 px-4
            lg:w-[1200px] lg:px-0
        `}>
            <NavBar session={user ? true : false} />
            <div className={`
                profile-body
                w-full max-w-[896px]
                mx-auto
                pb-18
                lg:w-[896px]
            `}>
                <div className={`
                    profile-header
                    w-full
                    mt-8
                    flex flex-col gap-4
                    md:flex-row md:justify-between md:items-start md:mt-16
                `}>
                    <div className={`
                        user-profile-info
                        flex flex-col items-center gap-4
                        md:flex-row md:items-start
                    `}>
                        <div className={`
                            user-avatar-container
                            w-20 h-20
                            md:w-24 md:h-24
                            rounded-full
                            bg-white
                            flex-shrink-0
                        `}>
                            <UserCircleIcon width={96} height={96} className={`text-accentText w-full h-full`} />
                        </div>
                        <div className={`
                            user-info-container
                            w-full
                            md:w-96
                            flex flex-col items-center justify-center
                            md:items-start
                        `}>
                            <div className={`
                                flex flex-col items-center gap-2
                                md:flex-row md:justify-between md:items-center md:gap-8
                                w-full
                            `}>
                                <h1 className={`
                                    text-2xl
                                    line-clamp-1
                                `}>
                                    {/* <DisplayName /> */}
                                    Jordan Walker
                                </h1>
                                <FollowButton profile={{profile: username}} user={user?.id || null}/>
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
                                <SectionTitle title={'Recently Reviewed'} />
                                <ViewAll pageLink="reviews" />
                            </div>
                            <RecentlyListened username={username} />
                            {/* Component to feth favorite albums based on username */}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
